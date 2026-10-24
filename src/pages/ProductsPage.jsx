import { useNavigate } from 'react-router';
import { Plus, FlaskConical } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import { SearchBox } from '@/shared/ui/search-box';
import { ProductRow, getProducts, productTypeLabel } from '@/entities/product';
import { useCan } from '@/entities/viewer';
import { useEntityList, useListSearch } from '@/shared/lib/list';

const NEW_PATH = '/settings/products/new';

const loadProducts = () => getProducts();
const searchFields = (product) => [product.name];
const toSearchResult = (product) => ({
  type: 'product',
  id: product.id,
  label: product.name,
  description: productTypeLabel(product.type),
});

export default function ProductsPage() {
  const navigate = useNavigate();
  const canWrite = useCan()('health:write');

  const list = useEntityList({ load: loadProducts });
  const { search, setSearch, results } = useListSearch(list.items, {
    fields: searchFields,
    toResult: toSearchResult,
  });

  return (
    <Page
      title="Productos"
      hideHeaderOnMobile
      actions={canWrite && (
        <Button icon={Plus} to={NEW_PATH}>
          Agregar producto
        </Button>
      )}
    >
      <Toolbar>
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar producto..."
          results={results}
          onSelect={canWrite ? (result) => navigate(`/settings/products/${result.id}`) : undefined}
        />
      </Toolbar>

      <EntityList
        items={list.items}
        loading={list.loading}
        error={list.loadError}
        onRetry={list.reload}
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

      {canWrite && <Fab icon={Plus} label="Agregar producto" to={NEW_PATH} />}
    </Page>
  );
}
