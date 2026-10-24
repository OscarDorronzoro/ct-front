import { FlaskConical } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { Badge } from '@/shared/ui/badge';
import { productTypeLabel } from '@/utils/health';

const days = (n) => `${n} ${n === 1 ? 'día' : 'días'}`;

// Products are deactivated, not deleted: events recorded with them keep pointing to them
export default function ProductRow({ product, editable = true }) {
  const { meatWithdrawalDays: meat, milkWithdrawalDays: milk } = product;
  const withdrawal = meat || milk
    ? `Retiro: carne ${days(meat)}, leche ${days(milk)}`
    : 'Sin retiro';

  return (
    <EntityRow
      avatar={<FlaskConical size={22} />}
      title={product.name}
      meta={[productTypeLabel(product.type), withdrawal]}
      tags={!product.active && <Badge tone="neutral">Inactivo</Badge>}
      to={editable ? `/settings/products/${product.id}` : undefined}
      entityLabel="producto"
    />
  );
}
