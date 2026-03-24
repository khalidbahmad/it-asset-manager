import client from './axiosClient';


export function normalizeAsset(a) {
    return {
        id:         a.id,
        tag:        a.asset_tag,
        serial:     a.serial_number,
        model:      a.model,
        brand:      a.brand?.name      ?? '—',
        category:   a.category?.name   ?? '—',
        location:   a.location?.name   ?? '—',
        status:     mapStatus(a.status?.name),
        assignedTo: null,
        purchase:   a.purchase_date,
    };
}

function mapStatus(name) {
    const map = {
        'Disponible':    'available',
        'Affecté':       'assigned',
        'En réparation': 'maintenance',
        'Retraité':      'retired',
    };
    return map[name] ?? 'available';
}

export const getAssets   = () => client.get('/assets').then(r => r.data.map(normalizeAsset));
export const createAndAssignAsset = (data) => client.post('/assets/create-and-assign', data);
export const deleteAsset = (id)   => client.delete(`/assets/${id}`);

