import os
from typing import List, Dict, Any, Optional, Union
import requests
import requests.exceptions
from datetime import datetime
from dotenv import load_dotenv
from flowsint_core.core.transform_base import Transform
from flowsint_types.wallet import CryptoWallet, CryptoWalletTransaction
from flowsint_core.core.graph_db import Neo4jConnection
from flowsint_core.core.logger import Logger

load_dotenv()


def wei_to_eth(wei_str):
    return int(wei_str) / 10**18


class CryptoWalletAddressToTransactions(Transform):
    """[ETHERSCAN] Resolve transactions for a wallet address (ETH)."""

    # Define types as class attributes - base class handles schema generation automatically
    InputType = CryptoWallet
    OutputType = CryptoWalletTransaction

    def __init__(
        self,
        sketch_id: Optional[str] = None,
        scan_id: Optional[str] = None,
        neo4j_conn: Optional[Neo4jConnection] = None,
        vault=None,
        params: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            sketch_id=sketch_id,
            scan_id=scan_id,
            neo4j_conn=neo4j_conn,
            params_schema=self.get_params_schema(),
            vault=vault,
            params=params,
        )

    @classmethod
    def required_params(cls) -> bool:
        return True

    @classmethod
    def icon(cls) -> str | None:
        return "cryptowallet"

    @classmethod
    def get_params_schema(cls) -> List[Dict[str, Any]]:
        """Declare required parameters for this transform"""
        return [
            {
                "name": "ETHERSCAN_API_KEY",
                "type": "vaultSecret",
                "description": "The Etherscan API key to use for the transaction lookup.",
                "required": True,
            },
            {
                "name": "ETHERSCAN_API_URL",
                "type": "url",
                "description": "The Etherscan API URL to use for the transaction lookup.",
                "required": False,
                "default": "https://api.etherscan.io/v2/api",
            },
        ]

    @classmethod
    def name(cls) -> str:
        return "cryptowallet_to_transactions"

    @classmethod
    def category(cls) -> str:
        return "CryptoWallet"

    @classmethod
    def key(cls) -> str:
        return "address"

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        results: List[OutputType] = []
        api_key = self.get_secret("ETHERSCAN_API_KEY", os.getenv("ETHERSCAN_API_KEY"))
        api_url = self.get_params().get("ETHERSCAN_API_URL", "https://api.etherscan.io/v2/api")
        for d in data:
            try:
                transactions = await self._get_transactions(d.address, api_key, api_url)
                results.append(transactions)
            except Exception as e:
                Logger.error(
                    self.sketch_id,
                    {"message": f"Error resolving transactions for {d.address}: {e}"},
                )
        return results

    async def _get_transactions(
        self, address: str, api_key: str, api_url: str
    ) -> List[CryptoWalletTransaction]:
        transactions = []
        """Get transactions for a wallet address."""
        params = {
            "chainid": 1,  # Ethereum mainnet
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": 100,
            "sort": "asc",
            "apikey": api_key,
        }
        print(f"[_GET_TRANSACTIONS DEBUG] Request params: {params}")
        try:
            print(f"[_GET_TRANSACTIONS DEBUG] Making request to {api_url}")
            response = requests.get(api_url, params=params)
            print(f"[_GET_TRANSACTIONS DEBUG] Response status: {response.status_code}")

            # Raise an exception for HTTP errors (4xx or 5xx status codes)
            response.raise_for_status()

        except requests.exceptions.ConnectionError as e:
            print(f"[_GET_TRANSACTIONS ERROR] Connection error: {e}")
            raise ValueError(
                f"An error occurred connecting to {api_url}: Connection failed - {str(e)}"
            )
        except requests.exceptions.Timeout as e:
            print(f"[_GET_TRANSACTIONS ERROR] Timeout: {e}")
            raise ValueError(
                f"An error occurred fetching {api_url}: Request timeout - {str(e)}"
            )
        except requests.exceptions.RequestException as e:
            print(f"[_GET_TRANSACTIONS ERROR] Request exception: {e}")
            raise ValueError(f"An error occurred fetching {api_url}: {str(e)}")

        try:
            data = response.json()
            print(f"[_GET_TRANSACTIONS DEBUG] Response JSON: {data}")
            print(f"[_GET_TRANSACTIONS DEBUG] Response JSON status: {data.get('status')}")
            print(f"[_GET_TRANSACTIONS DEBUG] Response JSON message: {data.get('message')}")
        except requests.exceptions.JSONDecodeError as e:
            print(f"[_GET_TRANSACTIONS ERROR] JSON decode error: {e}")
            raise ValueError(
                f"An error occurred fetching {api_url}: Invalid JSON response - {str(e)}"
            )

        # Check if the API returned an error
        if data.get("status") != "1":
            error_message = data.get("message", "Unknown API error")
            print(f"[_GET_TRANSACTIONS ERROR] API error: {error_message}")
            raise ValueError(f"An error occurred fetching {api_url}: {error_message}")

        results = data.get("result", [])
        print(f"[_GET_TRANSACTIONS DEBUG] Got {len(results)} transactions from API")
        for tx in results:
            # Properly determine source and target based on transaction data
            source_address = tx["from"]

            if tx["to"] is not None:
                target_address = tx["to"]
            else:
                # Contract creation transaction
                target_address = (
                    tx["contractAddress"] if tx["contractAddress"] else address
                )

            transactions.append(
                CryptoWalletTransaction(
                    source=CryptoWallet(address=source_address),
                    target=CryptoWallet(address=target_address),
                    hash=tx["hash"],
                    value=wei_to_eth(tx["value"]),
                    timestamp=tx["timeStamp"],
                    block_number=tx["blockNumber"],
                    block_hash=tx["blockHash"],
                    nonce=tx["nonce"],
                    transaction_index=tx["transactionIndex"],
                    gas=tx["gas"],
                    gas_price=tx["gasPrice"],
                    gas_used=tx["gasUsed"],
                    cumulative_gas_used=tx["cumulativeGasUsed"],
                    input=tx["input"],
                    contract_address=tx["contractAddress"],
                )
            )
        return transactions

    def postprocess(self, results: List[OutputType], original_input: List[InputType]) -> List[OutputType]:
        print(f"[POSTPROCESS DEBUG] Neo4j connection present: {bool(self.neo4j_conn)}")
        print(f"[POSTPROCESS DEBUG] Results type: {type(results)}")
        print(f"[POSTPROCESS DEBUG] Results length: {len(results)}")
        if not self.neo4j_conn:
            return results

        for transactions in results:
            print(f"[POSTPROCESS DEBUG] Processing {len(transactions)} transactions")
            for tx in transactions:
                print(f"[POSTPROCESS DEBUG] Creating nodes for tx: {tx.hash}")
                # Create or update both wallet nodes
                self.create_node(tx.source)
                self.create_node(tx.target)
                print(f"[POSTPROCESS DEBUG] Nodes created, creating edge")
                # Create transaction as an edge between wallets (keeping complex query for transaction properties)
                tx_query = """
                MATCH (source:cryptowallet {address: $source})
                MATCH (target:cryptowallet {address: $target})
                MERGE (source)-[tx:TRANSACTION {hash: $hash}]->(target)
                SET tx.value = $value,
                    tx.timestamp = $timestamp,
                    tx.block_number = $block_number,
                    tx.block_hash = $block_hash,
                    tx.nonce = $nonce,
                    tx.transaction_index = $transaction_index,
                    tx.gas = $gas,
                    tx.gas_price = $gas_price,
                    tx.gas_used = $gas_used,
                    tx.cumulative_gas_used = $cumulative_gas_used,
                    tx.input = $input,
                    tx.contract_address = $contract_address,
                    tx.sketch_id = $sketch_id,
                    tx.label = $hash,
                    tx.caption = $hash,
                    tx.type = "transaction"
                """
                print(f"[POSTPROCESS DEBUG] Executing query for hash: {tx.hash}")
                self.neo4j_conn.query(
                    tx_query,
                    {
                        "hash": tx.hash,
                        "source": tx.source.address,
                        "target": tx.target.address,
                        "value": tx.value,
                        "timestamp": tx.timestamp,
                        "block_number": tx.block_number,
                        "block_hash": tx.block_hash,
                        "nonce": tx.nonce,
                        "transaction_index": tx.transaction_index,
                        "gas": tx.gas,
                        "gas_price": tx.gas_price,
                        "gas_used": tx.gas_used,
                        "cumulative_gas_used": tx.cumulative_gas_used,
                        "input": tx.input,
                        "contract_address": tx.contract_address,
                        "sketch_id": self.sketch_id,
                    },
                )

                timestamp_str = (
                    datetime.fromtimestamp(int(tx.timestamp)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                    if tx.timestamp
                    else "Unknown time"
                )
                self.log_graph_message(
                    f"Transaction on {timestamp_str}: {tx.source.address} -> {tx.target.address}"
                )

        return results


# Make types available at module level for easy access
InputType = CryptoWalletAddressToTransactions.InputType
OutputType = CryptoWalletAddressToTransactions.OutputType
