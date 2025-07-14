export const defaultFieldsArr = ['propertyType', 'addressLine1', 'postalCode'];
export const importHeaders = [
  'id',
  'propertyType',
  'addressLine1',
  'addressLine2',
  'postalCode',
  'city',
  'state',
  'country',
  'notes',
  'renewalFundProperty',
  'yearOfConstruction',
  'createdAt',
];
export const importExampleRow = [
  '',
  'Residential22',
  '123 Main St',
  'Unit A',
  '12345',
  'New York',
  'NY',
  'USA',
  'Example note',
  '10000',
  '1990',
  '2025-05-21T12:00:00Z',
];

 export const loadmoreDefaultData ={
  id: crypto.randomUUID(),
  propertyType: "Residential",
  addressLine1: "123 Main St",
  addressLine2: "123 Main St",
  postalCode: "12345",
  city: "New York",
  state: "NY",
  country: "USA",
  notes: "Hello New York", // optional
  renewalFundProperty: 10000,
  yearOfConstruction: 1990,
  createdAt: "2025-05-21T12:00:00Z",
  address: "main st.",
}