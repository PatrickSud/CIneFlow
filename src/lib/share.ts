// Compartilhamento nativo (Web Share API) com fallback para copiar o link.
export type ShareResult = 'shared' | 'copied' | 'failed';

export async function shareContent(data: { title?: string; text?: string; url: string }): Promise<ShareResult> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  // 1) Bandeja nativa (celular e navegadores compatíveis)
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title: data.title, text: data.text, url: data.url });
      return 'shared';
    } catch (e) {
      // Usuário cancelou a bandeja: não trata como erro nem faz fallback.
      if (e && (e as DOMException).name === 'AbortError') return 'shared';
      // Caso contrário, tenta copiar.
    }
  }
  // 2) Fallback: copiar para a área de transferência
  try {
    const full = data.text ? `${data.text} ${data.url}` : data.url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(full);
      return 'copied';
    }
  } catch { /* ignora */ }
  // 3) Fallback legado
  try {
    const ta = document.createElement('textarea');
    ta.value = data.text ? `${data.text} ${data.url}` : data.url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}
