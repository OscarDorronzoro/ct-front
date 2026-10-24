import { useNavigate } from 'react-router';
import { FlaskConical } from 'lucide-react';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { useEntityList } from '@/shared/lib/list';
import { ProductRow, getProducts, productTypeLabel } from '@/entities/product';
import { useCan } from '@/entities/viewer';

const loadProducts = () => getProducts();
const searchFields = (product) => [product.name];
const toSearchResult = (product) => ({
  type: 'product',
  id: product.id,
  label: product.name,
  description: productTypeLabel(product.type),
});

// Products are deactivated, not deleted (events keep pointing to them)
export default function ProductsPage() {
  const navigate = useNavigate();
  const canWrite = useCan()('health:write');

  const list = useEntityList({ load: loadProducts });

  return (
    <EntityListPage
      title="Productos"
      addLabel="Agregar producto"
      newPath={canWrite ? '/settings/products/new' : null}
      list={list}
      search={{
        placeholder: 'Buscar producto...',
        fields: searchFields,
        toResult: toSearchResult,
        onSelect: canWrite ? (result) => navigate(`/settings/products/${result.id}`) : undefined,
      }}
      labels={{
        error: 'No se pudieron cargar los productos.',
        empty: 'No hay productos',
        emptyMessage: 'Cargue las vacunas, medicamentos y antiparasitarios que se usan, con sus días de retiro.',
      }}
      emptyIcon={FlaskConical}
      renderItem={(product) => (
        <ProductRow key={product.id} product={product} editable={canWrite} />
      )}
    />
  );
}
