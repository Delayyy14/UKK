export function sanitizeHTML(html: string): string {
    if (!html) return '';
    // Basic sanitization: remove script tags and on* event handlers
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/on\w+=\w+/gi, '')
        .replace(/javascript:[^"']*/gi, '');
}

export function sanitizeText(text: string): string {
    if (!text) return '';
    // Remove all HTML tags
    return text.replace(/<[^>]*>?/gm, '');
}
