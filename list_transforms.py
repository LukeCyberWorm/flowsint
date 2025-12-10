from flowsint_core.core.transform_registry import TransformRegistry
import flowsint_transforms

print("=" * 60)
print("TRANSFORMS REGISTRADOS:")
print("=" * 60)

for name in sorted([cls.name() for cls in TransformRegistry._registry.values()]):
    cls = TransformRegistry.get(name)
    doc = cls.__doc__.strip() if cls.__doc__ else "No description"
    print(f"  • {name:30} - {doc}")

print("=" * 60)
print(f"Total: {len(TransformRegistry._registry)} transforms")
print("=" * 60)
