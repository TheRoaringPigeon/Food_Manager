import { CATEGORIES, UNITS, LOCATIONS } from '../constants/ingredientConstants';

export const getIngredientFields = (formData, validateName) => [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'e.g., Chicken Breast',
    required: true,
    onBlur: () => validateName('name', formData.name),
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: CATEGORIES,
    required: true,
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    placeholder: 'e.g., 2',
    min: '0',
    step: 'any',
    required: true,
  },
  {
    name: 'unit',
    label: 'Unit',
    type: 'select',
    options: UNITS,
    required: true,
  },
  {
    name: 'expiryDate',
    label: 'Expiry Date',
    type: 'date',
    required: true,
  },
  {
    name: 'location',
    label: 'Location',
    type: 'select',
    options: LOCATIONS,
    required: true,
  },
];
