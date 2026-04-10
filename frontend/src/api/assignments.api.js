import client from './axiosClient';

export const assignAsset = (data) => client.post('/assignments', data);
export const returnAsset = (id)   => client.patch(`/assets/${id}/return`);

export const apiAssign = (assetId, { assign_type, assign_target_id, assign_target_name }) =>
    client.post('/assignments', { asset_id: assetId, type: assign_type, assign_target_id, assign_target_name });

export const apiReturn = (assignmentId) =>
    client.patch(`/assets/${assignmentId}/return`);