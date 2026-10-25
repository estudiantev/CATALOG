import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'productImages',
  access: (allow) => ({
    'product-images/*': [
      allow.guest.to(['get']),
      allow.authenticated.to(['read']),
      allow.groups(['INVENTORY', 'MARKETING']).to(['read', 'write']),
      allow.groups(['ADMIN']).to(['read', 'write', 'delete']),
    ],
  }),
});