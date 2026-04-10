import client from './axiosClient';
export const getAuditBySerial = (serial) => client.get(`/audit-logs/assets/${serial}`);