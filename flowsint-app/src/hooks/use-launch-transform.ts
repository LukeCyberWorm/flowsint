import { toast } from 'sonner'
import { useConfirm } from '@/components/use-confirm-dialog'
import { transformService } from '@/api/transform-service'
import { useLayoutStore } from '@/stores/layout-store'

export function useLaunchTransform(askUser: boolean = false) {
  const { confirm } = useConfirm()
  const openClonsole = useLayoutStore(s => s.openConsole)

  const launchTransform = async (
    node_ids: string[],
    transformName: string,
    sketch_id: string | null | undefined
  ) => {
    if (!sketch_id) return toast.error('Could not find the graph.')
    if (askUser) {
      const confirmed = await confirm({
        title: `${transformName} scan`,
        message: `You're about to launch ${transformName} transform on ${node_ids.length} items.`
      })
      if (!confirmed) return
    }
    const body = JSON.stringify({ node_ids, sketch_id })
    const count = node_ids.length
    console.log('[useLaunchTransform] Launching transform:', transformName, 'with body:', body)
    toast.promise(
      transformService.launch(transformName, body).then((response) => {
        console.log('[useLaunchTransform] Transform response:', response)
        return response
      }),
      {
        loading: 'Loading...',
        success: () =>
          `Transform ${transformName} has been launched on ${count} node${count > 1 ? 's' : ''}.`,
        error: (err) => {
          console.error('[useLaunchTransform] Transform error:', err)
          return `An error occurred launching transform.`
        }
      }
    )
    openClonsole()
    return
  }
  return {
    launchTransform
  }
}
