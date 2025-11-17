export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) {
    return '#';
  }
  const trimmedUrl = url.trim();
  // Allow http, https, mailto, tel, and data protocols, and relative paths starting with / or #
  if (/^(https|http|mailto|tel|data):/i.test(trimmedUrl) || /^[/#]/.test(trimmedUrl)) {
    return trimmedUrl;
  }
  // Forbids javascript:, vbscript:, etc. and defaults to '#' for safety
  return '#';
};
