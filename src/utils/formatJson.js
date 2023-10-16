export const jsonToHtml = (jsonString) => {
  // Convert structural characters to HTML tags
  let htmlString = jsonString
    .replace(/{/g, '<div class="json-object">{<br>')
    .replace(/}/g, '<br>}</div>')
    .replace(/\[/g, '<div class="json-array">[')
    .replace(/]/g, ']</div>')
    .replace(/,/g, ',<br>')
    .replace(/:/g, ': ')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Convert tabs to four spaces for HTML

  // Wrap keys and values with HTML tags
  const keyValueRegex = /"([^"]+)": ("[^"]*"|\d+|true|false|null)/g;
  htmlString = htmlString.replace(keyValueRegex, (match, key, value) => {
    return `<span class="json-key">"${key}"</span>: <span class="json-value">${value}</span>`;
  });

  return htmlString;
}