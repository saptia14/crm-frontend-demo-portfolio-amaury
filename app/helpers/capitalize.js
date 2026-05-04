import { helper } from '@ember/component/helper';

export default helper(function capitalize([str]) {
  if (typeof str !== 'string') return str;
  // Replace underscores with spaces and capitalize first letter
  const formatted = str.replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
});
