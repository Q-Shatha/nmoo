(() => {
  if (window.__nmooMobileControlsReady) return;
  window.__nmooMobileControlsReady = true;

  const isMobile = () => window.matchMedia("(max-width: 639px)").matches;
  const storageKey = "nmoo_cart";
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Math.floor(Number(value) || min)));
  const readItems = () => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  };
  const writeItems = (items) => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
    window.dispatchEvent(new Event("nmoo-cart-change"));
  };
  const captureMobileClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  };
  const getCartItemKey = (item) => {
    if (item.cartKey) return item.cartKey;
    const optionKey = Object.entries(item.selectedOptions || {})
      .filter(([, value]) => Boolean(value))
      .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");
    const addonKey = (item.selectedAddons || [])
      .map((addon) => addon.id)
      .filter(Boolean)
      .sort()
      .join("|");
    return `${item.vendorId || ""}::${item.productId}::${optionKey}::${addonKey}`;
  };
  const addItem = (item) => {
    const items = readItems();
    const normalizedItem = { ...item, cartKey: getCartItemKey(item) };
    const existing = items.find((cartItem) => getCartItemKey(cartItem) === normalizedItem.cartKey);
    if (existing) existing.quantity = Math.min(existing.stock, existing.quantity + normalizedItem.quantity);
    else items.push(normalizedItem);
    writeItems(items);
  };
  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const formatPrice = (value) => `${Number(value || 0).toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ر.س`;
  const getCartItemHref = (item) => {
    if (item.vendorUsername) return `/${encodeURIComponent(item.vendorUsername)}/products/${encodeURIComponent(item.productId)}`;
    if (item.vendorId) return `/vendors/${encodeURIComponent(item.vendorId)}/products/${encodeURIComponent(item.productId)}`;
    return "/";
  };
  const renderSelectedOptions = (item) => {
    const entries = Object.entries(item.selectedOptions || {});
    if (!entries.length) return "";

    return `
      <div class="mt-2 flex flex-wrap justify-end gap-2">
        ${entries
          .map(([name, value]) => `<span class="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">${escapeHtml(name)}: ${escapeHtml(value)}</span>`)
          .join("")}
      </div>
    `;
  };
  const renderSelectedAddons = (item) => {
    const addons = item.selectedAddons || [];
    if (!addons.length) return "";

    return `
      <div class="mt-2 flex flex-wrap justify-end gap-2">
        ${addons
          .map((addon) => `<span class="rounded-full bg-primary-container/35 px-3 py-1 text-xs font-bold text-primary">${escapeHtml(addon.name)} + ${formatPrice(addon.price)}</span>`)
          .join("")}
      </div>
    `;
  };
  const renderMobileCartFallback = () => {
    if (!isMobile() || window.location.pathname !== "/cart") return;
    const root = document.querySelector("[data-mobile-cart-root]");
    if (!root || root.hasAttribute("data-cart-rendered")) return;
    const vendorId = root.getAttribute("data-vendor-id") || new URLSearchParams(window.location.search).get("vendorId") || "";
    const items = readItems().filter((item) => !vendorId || item.vendorId === vendorId);
    if (items.length === 0) return;
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const count = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

    root.className = "grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]";
    root.setAttribute("data-cart-rendered", "true");
    root.innerHTML = `
      <section class="panel overflow-hidden">
        <div class="flex items-center justify-between border-b border-outline-variant/20 p-5">
          <h1 class="text-2xl font-black text-primary">سلة التسوق</h1>
        </div>
        <div class="divide-y divide-outline-variant/15">
          ${items
            .map(
              (item) => `
                <article class="grid grid-cols-[92px_1fr] gap-4 p-5 text-right">
                  <a class="relative block h-24 w-24 overflow-hidden rounded-xl bg-surface-container-low" href="${getCartItemHref(item)}">
                    <img class="h-full w-full object-cover" alt="${escapeHtml(item.title)}" src="${escapeHtml(item.imageUrl || "/nmoo-logo.png")}" loading="lazy" />
                  </a>
                  <div>
                    <a class="text-base font-bold text-on-surface hover:text-primary" href="${getCartItemHref(item)}">${escapeHtml(item.title)}</a>
                    ${renderSelectedOptions(item)}
                    ${renderSelectedAddons(item)}
                    <p class="mt-2 text-sm text-on-surface-variant">${Number(item.stock || 0)} متوفر</p>
                    <p class="mt-3 text-xl font-black text-primary">${formatPrice(item.price)}</p>
                    <p class="mt-2 text-sm font-bold text-on-surface-variant">الكمية: ${Number(item.quantity || 1)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <aside class="panel h-fit p-6 text-right">
        <h2 class="text-xl font-black text-on-surface">ملخص الطلب</h2>
        <div class="mt-5 space-y-3 border-b border-outline-variant/20 pb-5">
          <div class="flex items-center justify-between gap-4 text-on-surface-variant"><span>عدد المنتجات</span><span class="font-bold text-on-surface">${count}</span></div>
          <div class="flex items-center justify-between gap-4 text-on-surface-variant"><span>المجموع الفرعي</span><span class="font-bold text-on-surface">${formatPrice(subtotal)}</span></div>
          <div class="flex items-center justify-between gap-4 text-on-surface-variant"><span>الشحن</span><span class="font-bold text-on-surface">يحدد لاحقا</span></div>
        </div>
        <div class="mt-5 flex items-center justify-between">
          <span class="font-bold text-on-surface">الإجمالي المبدئي</span>
          <span class="text-2xl font-black text-primary">${formatPrice(subtotal)}</span>
        </div>
        <a class="primary-button mt-6 w-full py-4" href="${vendorId ? `/checkout?vendorId=${encodeURIComponent(vendorId)}` : "/checkout"}">متابعة الدفع</a>
        <a class="secondary-button mt-3 w-full py-3" href="/">متابعة التسوق</a>
      </aside>
    `;
  };
  const syncDisabled = (container) => {
    const input = container.querySelector("[data-quantity-input]");
    const decrease = container.querySelector("[data-quantity-action='decrease']");
    const increase = container.querySelector("[data-quantity-action='increase']");
    if (!input || !decrease || !increase || input.disabled) return;
    const value = clamp(input.value, Number(input.min || 1), Number(input.max || 999));
    input.value = String(value);
    decrease.disabled = value <= Number(input.min || 1);
    increase.disabled = value >= Number(input.max || 999);
  };

  document.addEventListener("click", (event) => {
    if (!isMobile()) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    const menuCloseButton = target.closest("[data-mobile-menu-close]");
    if (menuCloseButton) {
      const details = menuCloseButton.closest("details");
      if (!details) return;
      captureMobileClick(event);
      details.open = false;
      return;
    }

    const quantityButton = target.closest("[data-quantity-action]");
    if (quantityButton) {
      const container = quantityButton.closest("[data-cart-form]");
      const input = container?.querySelector("[data-quantity-input]");
      if (!container || !input || input.disabled) return;
      captureMobileClick(event);
      const direction = quantityButton.getAttribute("data-quantity-action") === "increase" ? 1 : -1;
      input.value = String(clamp(Number(input.value) + direction, Number(input.min || 1), Number(input.max || 999)));
      syncDisabled(container);
      return;
    }

    const cartSubmit = target.closest("[data-cart-submit]");
    if (cartSubmit) {
      const container = cartSubmit.closest("[data-cart-form]");
      const payloadInput = container?.querySelector("input[name='cartItem']");
      const quantityInput = container?.querySelector("[data-quantity-input]");
      if (!payloadInput || !quantityInput) return;
      captureMobileClick(event);
      const item = JSON.parse(payloadInput.value);
      item.quantity = clamp(quantityInput.value, 1, Number(quantityInput.max || item.stock || 999));
      addItem(item);
      renderMobileCartFallback();
      return;
    }

    const cartButton = target.closest("[data-cart-button]");
    if (cartButton?.getAttribute("data-cart-item")) {
      captureMobileClick(event);
      addItem(JSON.parse(cartButton.getAttribute("data-cart-item")));
      renderMobileCartFallback();
    }
  }, true);

  document.addEventListener("DOMContentLoaded", renderMobileCartFallback);
  window.addEventListener("pageshow", renderMobileCartFallback);
  window.addEventListener("nmoo-cart-change", renderMobileCartFallback);
  setTimeout(renderMobileCartFallback, 250);
})();
