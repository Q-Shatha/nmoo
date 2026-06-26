export interface Translations {
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  back: string;
  close: string;
  confirm: string;
  yes: string;
  no: string;
  all: string;
  none: string;
  or: string;
  and: string;
  required: string;
  optional: string;
  currency: string;
  noData: string;
  error: string;
  retry: string;
  success: string;
  login: string;
  logout: string;
  register: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  home: string;
  store: string;
  cart: string;
  account: string;
  myOrders: string;
  dashboard: string;
  overview: string;
  orders: string;
  products: string;
  shipping: string;
  discounts: string;
  reviews: string;
  analytics: string;
  settings: string;
  addProduct: string;
  totalRevenue: string;
  totalOrders: string;
  totalProducts: string;
  pendingOrders: string;
  recentOrders: string;
  allOrders: string;
  orderNumber: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
  action: string;
  details: string;
  searchOrders: string;
  noOrders: string;
  noOrdersMatch: string;
  printAll: string;
  printInvoices: string;
  printLabels: string;
  printOrder: string;
  printLabel: string;
  statusPending: string;
  statusPaid: string;
  statusProcessing: string;
  statusShipped: string;
  statusCompleted: string;
  statusCancelled: string;
  addNewProduct: string;
  productTitle: string;
  productPrice: string;
  productStock: string;
  productStatus: string;
  productCategory: string;
  draft: string;
  active: string;
  archived: string;
  noProducts: string;
  shippingMethods: string;
  addShippingMethod: string;
  shippingFee: string;
  freeShipping: string;
  pickupFromStore: string;
  carrier: string;
  eta: string;
  noShipping: string;
  discountCodes: string;
  addDiscountCode: string;
  discountCode: string;
  discountType: string;
  discountValue: string;
  noDiscounts: string;
  customerReviews: string;
  approved: string;
  pending: string;
  rejected: string;
  approve: string;
  reject: string;
  noReviews: string;
  reportsTitle: string;
  reportsDesc: string;
  salesSummary: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  monthlySales: string;
  topProducts: string;
  salesByCountry: string;
  customerBehavior: string;
  abandonedCarts: string;
  totalBuyers: string;
  repeatBuyers: string;
  repeatRate: string;
  avgOrderValue: string;
  topPayment: string;
  avgItemsPerOrder: string;
  noAbandonedCarts: string;
  ordersCount: (n: number) => string;
  avgLabel: (price: string) => string;
  piecesCount: (n: number) => string;
  daysAgo: (n: number) => string;
  invoicesCount: (n: number) => string;
  labelsCount: (n: number) => string;
  buyers: (n: number) => string;
  notEnoughData: string;
  storeSettings: string;
  settingsPageDesc: string;
  settingsLoadError: string;
  storeName: string;
  storeUsername: string;
  logoUrl: string;
  primaryColor: string;
  saveSettings: string;
  dashboardUnavailableTitle: string;
  dashboardUnavailableDesc: string;
  backToDashboard: string;
  needsLoginTitle: string;
  loginBtn: string;
  emptyPanel: string;
  cashOnDelivery: string;
  onlinePayment: string;
  printTitle: string;
  print: string;
  printInvoicesTitle: string;
  printLabelsTitle: string;
  printDateRange: string;
  fromDate: string;
  toDate: string;
  printAllIfNoDate: string;
  invoice: string;
  shippingLabel: string;
  language: string;
  arabic: string;
  english: string;
  numberLocale: string;

  // Dashboard overview page
  dashboardTitle: string;
  dashboardDesc: string;
  defaultMerchant: string;
  dailyPulse: string;
  totalSalesDesc: string;
  totalOrdersRegistered: string;
  totalOrdersRegisteredDesc: string;
  last7Days: string;
  salesMovement: string;
  completedOrders: string;
  activeProducts: string;
  activeDiscounts: string;
  ofCount: (total: number) => string;
  metricsProducts: string;
  metricsShipping: string;
  metricsStorePages: string;
  metricsDiscountCodes: string;
  metricActive: (n: number) => string;
  metricEnabled: (n: number) => string;
  metricPublished: (n: number) => string;
  recentOrdersDesc: string;
  viewAllOrders: string;
  orderTitle: (id: string) => string;
  orderCount: string;
  orderAmount: string;
  orderDate: string;

  // Analytics page
  unknownProduct: string;
  unknownCountry: string;

  // DashboardProductManager
  productUpdated: string;
  productUpdateError: string;
  confirmDeleteProduct: (title: string) => string;
  productRemovedFromList: string;
  productDeleteError: string;
  productRestored: string;
  productRestoreError: string;
  manageProducts: string;
  manageProductsDesc: string;
  editProductTitle: string;
  productFieldsBasic: string;
  productFieldsVariants: string;
  productFieldsAddons: string;
  productFieldsImages: string;
  saving: string;
  saveEdit: string;

  // AddProductForm / EditProductForm
  categoryAddedAndSelected: string;
  categoryAddError: string;
  addProductError: string;
  productDataTitle: string;
  productDataDesc: string;
  variantsAccordionDesc: string;
  addonsAccordionDesc: string;
  newCategoryTitle: string;
  newCategoryDesc: string;
  categoryNamePlaceholder: string;
  addingCategory: string;
  addCategoryButton: string;
  imagesAccordionDesc: string;
  addingProduct: string;
  addProductButton: string;
  backToProducts: string;
  editProductDataDesc: string;
  variantsAccordionEditDesc: string;
  savingEdit: string;

  // New/Edit product pages
  addProductPageDesc: string;
  addProductPageError: string;
  editProductPageTitle: string;
  editProductPageDesc: string;
  editProductPageError: string;
  productNotFoundOrForbidden: string;

  // CategoryManager
  categoryNameTooShort: string;
  categoryUpdated: string;
  categoryUpdateError: string;
  confirmDeleteCategory: (name: string) => string;
  categoryDeleted: string;
  categoryDeleteError: string;
  manageCategoriesTitle: string;
  manageCategoriesDesc: string;
  yourCategories: string;
  noCustomCategories: string;
  productCountInCategory: (n: number) => string;
  editCategory: string;
  editCategoryAriaLabel: (name: string) => string;
  deleteCategory: string;
  deleteCategoryAriaLabel: (name: string) => string;

  // ProductFields
  defaultLangHint: string;
  productNameLabel: string;
  productBadge: string;
  productBadgePlaceholder: string;
  productPriceLabel: string;
  discountTypeLabel2: string;
  noDiscount: string;
  percentageDiscount: string;
  fixedDiscount: string;
  discountValueLabel: string;
  quantityLabel2: string;
  currentTotal: string;
  categoryLabel: string;
  noCategory: string;
  statusLabel: string;
  productDescriptionLabel: string;

  // dashboard-data
  dashboardVendorOnly: string;
  dashboardLoadError: string;

  // Products page
  productsDesc: string;
  productsLoadError: string;

  // Shipping page
  shippingDesc: string;
  shippingLoadError: string;

  // Discounts page
  discountsDesc: string;
  discountsLoadError: string;

  // Reviews page
  reviewsDesc: string;
  reviewsLoadError: string;

  // Store pages (dashboard)
  newStorePageTitle: string;
  newStorePageDesc: string;
  editStorePageTitle: string;
  editStorePageDesc: string;
  storePageNotFound: string;
  storePageLoadError: string;

  // Shipping pages (dashboard)
  newShippingPageDesc: string;
  editShippingPageDesc: string;
  shippingMethodNotFound: string;
  shippingMethodLoadError: string;

  // ShippingMethodManager
  carrierDescPlaceholder: string;

  // ShippingMethodForm
  editShippingMethod: string;
  addShippingMethod2: string;
  shippingFormDesc: string;
  carrierCode: string;
  carrierCodePlaceholder: string;
  carrierName: string;
  deliveryDuration: string;
  deliveryDurationPlaceholder: string;
  shortDescription: string;
  carrierOptionsTitle: string;
  enabledForCustomers: string;
  enableCashOnDelivery: string;
  isPickupOption: string;
  googleMapsLink: string;
  googleMapsPlaceholder: string;
  googleMapsHint: string;
  freeShippingWithMinimum: string;
  freeShippingMinimumLabel: string;
  freeShippingMinimumPlaceholder: string;
  deliveryZonesTitle: string;
  deliveryZonesDesc: string;
  deliveryZonesInfo: string;
  country: string;
  regionOrState: string;
  cityOrProvince: string;
  allCountry: string;
  allRegion: string;
  addLocation: string;
  deleteLocation: string;
  noZonesSelected: string;
  savingShipping: string;
  saveShipping: string;

  // ShippingMethodManager
  carriersTitle: string;
  carriersDesc: string;
  addCarrier: string;
  carrierEnabled: string;
  carrierStopped: string;
  carrierFee: (fee: string) => string;
  pickupFromStoreLabel: string;
  freeShippingFrom: (amount: string) => string;
  deliverTo: (locations: string) => string;
  deliverToAll: string;
  editCarrier: (name: string) => string;
  toggleCarrier: (action: string, name: string) => string;
  deleteCarrier: (name: string) => string;
  confirmDeleteCarrier: (name: string) => string;
  enableAction: string;
  disableAction: string;
  free: string;
  carriersUpdated: string;
  carriersAdded: string;
  carriersDeleted: string;
  carriersToggleError: string;
  carriersSaveError: string;
  carriersDeleteError: string;
  noCarriersYet: string;

  // DiscountCodeManager
  discountCodesTitle: string;
  discountCodesDesc: string;
  activeCodesCount: (n: number) => string;
  editDiscountCode: string;
  addDiscountCode2: string;
  discountFormDesc: string;
  code: string;
  discountTypeLabel: string;
  percentage: string;
  fixedAmount: string;
  percentageValue: string;
  amountValue: string;
  totalUsageLimit: string;
  perCustomerLimit: string;
  noLimit: string;
  enabled: string;
  enabledShort: string;
  startsAt: string;
  expiresAt: string;
  applyToProducts: string;
  noProductsAvailable: string;
  allProductsDefault: string;
  update: string;
  discountSaved: string;
  discountSaveError: string;
  activeStatus: string;
  stoppedStatus: string;
  productsColumn: string;
  usageColumn: string;
  perCustomerColumn: string;
  actionsColumn: string;
  allProducts: string;
  noDiscountsYet: string;
  editCode: (code: string) => string;
  toggleCode: (action: string, code: string) => string;
  deleteCode: (code: string) => string;

  // ReviewModerationPanel
  productReviews: string;
  productReviewsDesc: string;
  reviewsCount: (n: number) => string;
  allTab: string;
  pendingReview: string;
  publishedReviews: string;
  rejectedReviews: string;
  noReviewsInSection: string;
  productColumn: string;
  customerColumn: string;
  ratingColumn: string;
  commentColumn: string;
  actionColumn: string;
  publish: string;
  rejectAction: string;
  undoAction: string;
  viewAll: string;
  noComment: string;
  fullComment: string;
  errorOccurred: string;
  okButton: string;
  updateReviewError: string;

  // OrderDetail page (dashboard)
  orderDetailNeedsVendorLogin: string;
  orderDetailLoadError: string;
  backToOrders: string;
  orderDetails: (id: string) => string;
  lastUpdated: (date: string) => string;
  printInvoiceBtn: string;
  printLabelBtn: string;
  orderItems: string;
  productDeleted: string;
  quantityLabel: (qty: number) => string;
  unitPriceLabel: (price: string) => string;
  buyerData: string;
  buyerName: string;
  buyerEmail: string;
  orderNumberLabel: string;
  orderDateLabel: string;
  orderSummaryTitle: string;
  subtotalLabel: string;
  shippingLabel2: (carrier: string) => string;
  discountLabel: (code: string) => string;
  totalLabel: string;
  cantOpenOrder: string;
  backToOrdersBtn: string;
  needsLoginOrder: string;
  loginToSeeOrder: string;

  // CartView
  emptyCart: string;
  emptyCartDesc: string;
  browseProducts: string;
  shoppingCart: string;
  clearCart: string;
  inStock: (n: number) => string;
  cartSummaryTitle: string;
  productCount: string;
  subtotal: string;
  shippingTBD: string;
  preliminaryTotal: string;
  proceedToCheckout: string;
  continueShopping: string;

  // CheckoutView
  noProductsForCheckout: string;
  noProductsForCheckoutDesc: string;
  openStore: string;
  confirmShippingAddress: string;
  confirmShippingDesc: string;
  needsLoginCheckout: string;
  needsLoginCheckoutDesc: string;
  loginToCheckout: string;
  selectShippingCarrier: string;
  selectShippingDesc: string;
  merchantFees: string;
  noShippingAvailable: string;
  noShippingAvailableDesc: string;
  vendorCount: (n: number) => string;
  paymentOptions: string;
  paymentOptionsDesc: string;
  onlinePaymentLabel: string;
  onlinePaymentDesc: string;
  cashOnDeliveryLabel: string;
  cashOnDeliveryDesc: string;
  cashOnDeliveryDisabled: string;
  orderReview: string;
  discountCodeLabel: string;
  discountCodePlaceholder: string;
  applying: string;
  apply: string;
  discountApplied: (amount: string) => string;
  discountRow: (code: string) => string;
  totalBeforePayment: string;
  cashOnDeliveryNote: string;
  onlinePaymentNote: string;
  creatingOrder: string;
  confirmAddressAndPay: string;
  confirmOrderCOD: string;
  editAddress: string;
  editCart: string;
  savedAddress: string;
  savedAddressComplete: string;
  savedAddressIncomplete: string;
  fullName: string;
  mobileNumber: string;
  countryLabel: string;
  regionLabel: string;
  cityLabel: string;
  districtLabel: string;
  streetLabel: string;
  buildingNumber: string;
  postalCode: string;
  nationalAddress: string;
  incomplete: string;
  loginFirst: string;
  writeCodeFirst: string;
  loginToCheckDiscount: string;

  // AccountMenu
  accountMenuLabel: string;
  closeMenu: string;
  myOrdersLink: string;
  accountSettings: string;
  shippingAddress: string;
  storeLink: string;
  loginLink: string;
  registerLink: string;
  startFree: string;
  roleAdmin: string;
  roleVendor: string;
  roleBuyer: string;

  // AddToCartButton
  outOfStock: string;
  addedToCart: string;
  addToCart: string;

  // Login page
  loginTitle: string;
  loginSubtitle: string;
  demoAccounts: string;
  vendorAccount: string;
  buyerAccount: string;
  loginPassword: string;
  buyerLogin: string;
  vendorLogin: string;
  emailLabel: string;
  passwordLabel: string;
  noAccount: string;
  createNewAccount: string;

  // Register page
  startWithNmoo: string;
  createNewAccountTitle: string;
  registerDesc: string;

  // Account page
  myAccount: string;
  accountSettingsTitle: string;
  emailInfo: string;
  accountType: string;
  accountNumber: string;
  shippingAddressSection: string;
  editAddressInAccount: string;
  editAddressLink: string;
  noAddressYet: string;
  goToDashboard: string;
  goToOrders: string;
  loginRequiredAccount: string;
  loginFirstAccount: string;
  failedToLoadAccount: string;

  // Address page
  addressPageChip: string;
  addressPageTitle: string;
  addressPageDesc: string;
  loginRequiredAddress: string;
  loginFirstAddress: string;
  failedToLoadAddressAccount: string;

  // AddressForm
  savingAddress: string;
  saveAddress: string;
  failedToSaveAddress: string;
  nationalAddressPlaceholder: string;

  // AvatarSettings / AccountAvatar
  changeAvatarLabel: string;
  avatarTitle: string;
  avatarDesc: string;
  avatarUploading: string;
  avatarClickHint: string;
  avatarUpdated: string;
  failedToUploadAvatar: string;

  // EditableName
  editNameLabel: string;
  nameTooShort: string;
  nameUpdated: string;
  failedToUpdateName: string;

  // BrandLogo
  brandLogoLabel: string;

  // AddToCartWithQuantity
  quantityInputLabel: string;
  decreaseQuantity: string;
  increaseQuantity: string;

  // Orders page (buyer)
  myOrdersChip: string;
  myOrdersTitle: string;
  myOrdersDesc: string;
  noOrdersYetBuyer: string;
  browseStore: string;
  orderHeading: (id: string) => string;
  itemsCount: (n: number) => string;
  loginRequiredOrders: string;
  loginFirstOrders: string;
  failedToLoadOrders: string;

  // Vendor store page
  shopNow: string;
  storePolicy: string;
  storeDesc: string;
  searchProducts: string;
  showAllProducts: string;
  noActiveProducts: string;
  showMore: string;
  joinDate: string;
  overallRating: string;
  totalProductsLabel: string;
  locationUnsupported: string;
  locationNeedsAddress: string;
  customerReviewsSection: string;
  customerReviewsDesc: (storeName: string) => string;
  writeReview: string;
  nmooCustomer: string;
  vendorPageError: string;
  backToStore: string;
  vendorOpenError: string;

  // LandingClient hero
  landingBadge: string;
  landingHeroTitle1: string;
  landingHeroTitle2: string;
  landingHeroDesc: string;
  landingUrlLabel: string;
  landingOpenFree: string;
  landingViewExample: string;
  landingGlobal: string;
  landingUniqueUrl: string;
  landingSecurePayment: string;
  landingFastLaunch: string;
  landingDashboardTitle: string;
  landingDashboardActive: string;
  landingSalesLabel: string;
  landingOrdersLabel: string;
  landingCustomersLabel: string;
  landingWeeklySales: string;
  landingRecentOrders: string;
  landingNewOrder: string;
  landingNewProducts: string;
  landingOrderStatusCompleted: string;
  landingOrderStatusShipping: string;
  landingOrderStatusProcessing: string;

  // LandingStats
  landingStatCountries: string;
  landingStatMerchants: string;
  landingStatOrders: string;
  landingStatSatisfaction: string;
  landingStatFreeVal: string;
  landingStatFree: string;
  landingStatMinutes: string;
  landingStatSupport: string;
  landingStatLanguages: string;

  // LandingHowItWorks
  landingHowBadge: string;
  landingHowTitle: string;
  landingHowDesc: string;
  landingStep1Title: string;
  landingStep1Desc: string;
  landingStep2Title: string;
  landingStep2Desc: string;
  landingStep3Title: string;
  landingStep3Desc: string;
  landingStep4Title: string;
  landingStep4Desc: string;

  // LandingDashboardFeatures
  landingFeaturesBadge: string;
  landingFeaturesTitle: string;
  landingFeaturesDesc: string;
  landingFeat1Title: string;
  landingFeat1Desc: string;
  landingFeat1P1: string;
  landingFeat1P2: string;
  landingFeat1P3: string;
  landingFeat1P4: string;
  landingFeat2Title: string;
  landingFeat2Desc: string;
  landingFeat2P1: string;
  landingFeat2P2: string;
  landingFeat2P3: string;
  landingFeat2P4: string;
  landingFeat3Title: string;
  landingFeat3Desc: string;
  landingFeat3P1: string;
  landingFeat3P2: string;
  landingFeat3P3: string;
  landingFeat3P4: string;
  landingFeat4Title: string;
  landingFeat4Desc: string;
  landingFeat4P1: string;
  landingFeat4P2: string;
  landingFeat4P3: string;
  landingFeat4P4: string;
  landingFeat5Title: string;
  landingFeat5Desc: string;
  landingFeat5P1: string;
  landingFeat5P2: string;
  landingFeat5P3: string;
  landingFeat5P4: string;
  landingFeat6Title: string;
  landingFeat6Desc: string;
  landingFeat6P1: string;
  landingFeat6P2: string;
  landingFeat6P3: string;
  landingFeat6P4: string;
  landingFeat7Title: string;
  landingFeat7Desc: string;
  landingFeat7P1: string;
  landingFeat7P2: string;
  landingFeat7P3: string;
  landingFeat7P4: string;
  landingFeat8Title: string;
  landingFeat8Desc: string;
  landingFeat8P1: string;
  landingFeat8P2: string;
  landingFeat8P3: string;
  landingFeat8P4: string;
  landingFeat9Title: string;
  landingFeat9Desc: string;
  landingFeat9P1: string;
  landingFeat9P2: string;
  landingFeat9P3: string;
  landingFeat9P4: string;

  // LandingFeat10 — Multi-language products
  landingFeat10Title: string;
  landingFeat10Desc: string;
  landingFeat10P1: string;
  landingFeat10P2: string;
  landingFeat10P3: string;
  landingFeat10P4: string;

  // LandingGlobal
  landingGlobalBadge: string;
  landingGlobalTitle: string;
  landingGlobalDesc: string;
  landingGlobalP1: string;
  landingGlobalP2: string;
  landingGlobalP3: string;
  landingGlobalP4: string;
  landingGlobalP5: string;
  landingMoreCountries: string;
  landingCountrySA: string;
  landingCountryAE: string;
  landingCountryKW: string;
  landingCountryQA: string;
  landingCountryBH: string;
  landingCountryOM: string;
  landingCountryEG: string;
  landingCountryJO: string;
  landingCountryDE: string;
  landingCountryUS: string;
  landingCountryGB: string;
  landingCountryFR: string;

  // LandingUniqueURL
  landingUrlBadge: string;
  landingUrlTitle: string;
  landingUrlDesc: string;
  landingUrlP1: string;
  landingUrlP2: string;
  landingUrlP3: string;
  landingUrlP4: string;
  landingUrlP5: string;
  landingUrlCta: string;
  landingUrlYourStore: string;
  landingUrlShopName1: string;
  landingUrlShopName2: string;
  landingUrlShopName3: string;
  landingUrlActiveLabel: string;
  landingUrlYourStoreLabel: string;

  // LandingPricing
  landingPricingBadge: string;
  landingPricingTitle: string;
  landingPricingDesc: string;
  landingPlan1Name: string;
  landingPlan1Period: string;
  landingPlan1F1: string;
  landingPlan1F2: string;
  landingPlan1F3: string;
  landingPlan1F4: string;
  landingPlan1F5: string;
  landingPlan1Cta: string;
  landingPlan2Name: string;
  landingPlan2Period: string;
  landingPlan2Badge: string;
  landingPlan2F1: string;
  landingPlan2F2: string;
  landingPlan2F3: string;
  landingPlan2F4: string;
  landingPlan2F5: string;
  landingPlan2F6: string;
  landingPlan2Cta: string;
  landingPlan3Name: string;
  landingPlan3Period: string;
  landingPlan3F1: string;
  landingPlan3F2: string;
  landingPlan3F3: string;
  landingPlan3F4: string;
  landingPlan3F5: string;
  landingPlan3F6: string;
  landingPlan3Cta: string;

  // LandingCTA
  landingCtaBadge: string;
  landingCtaTitle: string;
  landingCtaDesc: string;
  landingCtaPrimary: string;
  landingCtaSecondary: string;

  // Checkout
  checkoutEmptyTitle: string;
  checkoutEmptyDesc: string;
  checkoutOpenStore: string;
  checkoutConfirmAddressTitle: string;
  checkoutConfirmAddressDesc: string;
  checkoutNeedLoginTitle: string;
  checkoutNeedLoginDesc: string;
  checkoutLoginBtn: string;
  checkoutShippingTitle: string;
  checkoutShippingDesc: string;
  checkoutMerchantFees: string;
  checkoutNoShipping: string;
  checkoutNoShippingDesc: string;
  checkoutVendorCount: (n: number) => string;
  checkoutPaymentTitle: string;
  checkoutPaymentDesc: string;
  checkoutOnlineLabel: string;
  checkoutOnlineDesc: string;
  checkoutCodLabel: string;
  checkoutCodDesc: string;
  checkoutCodUnavailable: string;
  checkoutCodUnavailableDesc: string;
  checkoutOrderReview: string;
  checkoutSubtotal: string;
  checkoutShipping: (name: string) => string;
  checkoutShippingUnset: string;
  checkoutDiscountCode: string;
  checkoutApplying: string;
  checkoutApply: string;
  checkoutDiscount: (code: string) => string;
  checkoutTotal: string;
  checkoutCodNote: string;
  checkoutOnlineNote: string;
  checkoutCreatingOrder: string;
  checkoutConfirmCod: string;
  checkoutConfirmOnline: string;
  checkoutEditAddress: string;
  checkoutEditCart: string;
  checkoutSavedAddress: string;
  checkoutAddressComplete: string;
  checkoutAddressIncomplete: string;
  checkoutIncomplete: string;
  checkoutFreeShipping: string;
  checkoutDiscountApplied: (amount: string) => string;
  checkoutQty: (n: number) => string;
  checkoutFailedShipping: string;
  checkoutLoginFirst: string;
  checkoutDiscountLoginFirst: string;
  checkoutEnterCode: string;
  checkoutFailedDiscount: string;
  checkoutFillAddress: string;
  checkoutSelectShipping: string;
  checkoutFailedOrder: string;

  // Product page
  productStatusActive: string;
  productStatusDraft: string;
  productStatusArchived: string;
  allProductsCategory: string;
  productChip: string;
  discount: string;
  storeNavLabel: string;
  storeNavIconAlt: string;
  loadingLabel: string;

  // Payment page
  paymentChip: string;
  paymentOrderHeading: (id: string) => string;
  paymentDesc: string;
  paymentSuccessNote: string;
  paymentCancelledNote: string;
  paymentCodNote: string;
  paymentDefaultProduct: string;
  paymentSummaryTitle: string;
  paymentOrderStatus: string;
  paymentMethod: string;
  paymentCodMethod: string;
  paymentOnlineMethod: string;
  paymentShipping: (carrier: string) => string;
  paymentDiscount: (code: string) => string;
  paymentDefaultDiscountCode: string;
  paymentTotal: string;
  paymentViewOrders: string;
  paymentUnavailableTitle: string;
  paymentLoginFirst: string;
  paymentLoadFailed: string;
  paymentFreeShipping: string;
  paymentShippingUnset: string;
  paymentShippingCarrierSpl: string;
  paymentShippingCarrierSmsa: string;
  paymentShippingCarrierAramex: string;
  paymentShippingCarrierPickup: string;
  paymentActionsLoginFirst: string;
  paymentActionsGatewayFailed: string;
  paymentActionsGatewayDisabled: string;
  paymentActionsStartFailed: string;
  paymentActionsOpening: string;
  paymentActionsPayNow: string;
  paymentActionsBackToOrders: string;
  accountOptionsLabel: string;
  cardUnavailable: string;
  cardAdded: string;
  cardChooseType: string;
  cardChooseAll: string;
  cardPrice: string;
  cardAvailable: string;
  inStockCount: (n: number) => string;
  defaultProductDesc: string;
  chooseProductType: string;
  chooseRequiredOption: string;
  optionalAddons: string;
  goToImageLabel: (n: number) => string;
  viewImageLabel: (n: number) => string;
  // ReviewForm
  reviewFailedSave: string;
  reviewNoProducts: string;
  reviewNoProductsDesc: string;
  reviewStoreChip: string;
  reviewWriteTitle: string;
  reviewWriteDesc: string;
  reviewProductLabel: string;
  reviewRatingLabel: string;
  reviewStarLabel: (n: number) => string;
  reviewCommentLabel: string;
  reviewCommentPlaceholder: string;
  reviewSaving: string;
  reviewPublish: string;
  reviewBack: string;

  // ReviewsCarousel
  reviewsNone: string;
  reviewsViewAll: string;
  reviewsPrevious: string;
  reviewsNext: string;
  reviewsClose: string;
  reviewsAllTitle: string;
  reviewsDefaultUser: string;
  reviewsDefaultCity: string;
  reviewsDefaultText: (context: string) => string;
  reviewsStoreFallback: string;

  reviewLoginRequired: string;
  reviewNotAllowed: string;
  reviewLoginMessage: string;
  reviewBuyerOnlyMessage: string;
  reviewPageError: string;
  reviewPageLoginBtn: string;
  reviewPageBackBtn: string;
  productStatusLabel: string;
  productCategoryLabel: string;
  merchantLabel: string;
  uncategorized: string;
  productReviewsTitle: string;
  productReviewsSubtitle: (title: string) => string;
  relatedProducts: string;
  defaultStoreName: string;

  // Login page
  loginPageChip: string;

  // Register page
  registerPageChip: string;

  // login submit route errors
  loginFailed: string;
  loginServerError: string;
  loginRoleMismatchBuyer: string;
  loginRoleMismatchVendor: string;

  // LoginForm
  loginAccountTypeLabel: string;
  loginEnterAs: (role: string) => string;

  // RegisterForm
  buyerAccountType: string;
  vendorAccountType: string;
  registerBuyerHint: string;
  creatingAccount: string;
  createAccount: string;
  hasAccount: string;
  failedToCreateAccount: string;

  // Vendor page fallback reviews
  fallbackReviewText1: string;
  fallbackReviewText2: string;
  fallbackReviewName1: string;
  fallbackReviewName2: string;
  fallbackReviewCity1: string;
  fallbackReviewCity2: string;
  fallbackProductTitle: string;
  fallbackReviewDefault: string;

  // PublicFooter
  footerQuickLinks: string;
  footerHome: string;
  footerCart: string;
  footerOrders: string;
  footerStorePages: string;
  footerNoPagesYet: string;
  footerNoLinks: string;
  footerContactStore: string;
  footerNoContact: string;
  footerCopyright: string;
  footerSocialWhatsapp: string;
  footerSocialInstagram: string;
  footerSocialTiktok: string;
  footerSocialLine: string;
  footerSocialTelegram: string;
  footerSocialX: string;
  footerSocialSnapchat: string;
  footerSocialYoutube: string;
  footerSocialEmail: string;
  footerSocialWebsite: string;

  // store-pages
  storePagesLastUpdated: (date: string) => string;
  storePagesBackToStore: string;
  storePagesDefaultStore: string;

  // ProductOptionsEditor
  productVariantsTitle: string;
  productVariantsDesc: string;
  addVariant: string;
  noVariants: string;
  variantName: string;
  variantNamePlaceholder: string;
  variantValuesTitle: string;
  addVariantValue: string;
  variantValueLabel: string;
  variantStockLabel: string;
  variantPriceLabel: string;
  variantValuePlaceholder: string;
  stockPlaceholder: string;
  pricePlaceholder: string;
  deleteVariantValue: string;
  deleteVariant: string;

  // ProductAddonsEditor
  productAddonsTitle: string;
  productAddonsDesc: string;
  noAddons: string;
  addonName: string;
  addonPrice: string;
  addonEnabled: string;
  addonNamePlaceholder: string;
  deleteAddon: string;

  // ProductImageUploader
  imageUploadError: string;
  productImagesLabel: string;
  productImagesDesc: string;
  imagesAdded: (n: number) => string;
  noImagesSelected: string;
  uploading: string;
  chooseImages: string;
  addImageUrl: string;
  productImageAlt: string;
  deleteImage: string;

  // ProductRow / DeletedProductRow
  noDescription: string;
  priceLabel: string;
  discountFrom: string;
  badgeLabel: string;
  stockLabel: string;
  imagesLabel: string;
  variantsLabel: string;
  addonsLabel: string;
  editProductAriaLabel: (title: string) => string;
  deleteProductAriaLabel: (title: string) => string;

  // DeletedProductsSection / DeletedProductRow
  archivedProductsTitle: string;
  archivedProductsDesc: (count: number) => string;
  restoreProduct: string;
  expiredRestore: string;
  remainingDays: (days: number) => string;

  // Print all orders page
  unauthorized: string;
  ordersLoadError: string;
  orderLoadError: string;
  statusLabel2: string;
  paymentMethodLabel: string;
  orderStatusUpdated: string;
  orderStatusUpdateError: string;
  editOrderStatus: string;
  selectStatusHint: string;
  savingStatus: string;
  saveStatus: string;
  unspecified: string;
  discountCodeFallback: string;
  invoiceCount: (n: number) => string;
  defaultStoreName2: string;
  invoiceLabel: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierLabel: string;
  buyerLabel: string;
  invProductColumn: string;
  quantityColumn: string;
  unitPriceColumn: string;
  totalColumn: string;
  subtotalLabel2: string;
  shippingLabel3: string;
  discountLabel2: string;
  grandTotalLabel: string;
  invoiceThankYou: string;
  addressSeparator: string;
  labelCount: (n: number) => string;
  shippingLabelTitle: string;
  recipientLabel: string;
  noAddressLabel: string;
  senderLabel: string;
  contentsLabel: string;
  shippingInfoLabel: string;
  orderDateLabel2: string;
  printOrdersTitle: (query: string | null) => string;
  printDate: string;
  printCount: (n: number) => string;
  printOrderNumber: string;
  printProducts: string;
  printPaymentMethod: string;
  printGrandTotal: (amount: string) => string;

  // StoreLifecycleManager
  storePausedMsg: string;
  storeResumedMsg: string;
  storeStatusUpdateError: string;
  deleteStoreConfirmText: string;
  deleteStoreTypeHint: string;
  storeDeleteError: string;
  storeStatusTitle: string;
  storeStatusDesc: string;
  currentStatusLabel: string;
  storePauseWarning: string;
  resumeStore: string;
  pauseStore: string;
  deleteStorePermanentTitle: string;
  deleteStorePermanentDesc: string;
  deleteStoreTypeLabel: string;
  deleteStorePermanentButton: string;
  storeStatusPaused: string;
  storeStatusDeleted: string;
  storeStatusActive: string;

  // StorePageManager / StorePageForm
  storePageUpdated: string;
  storePageAdded: string;
  storePageSaveError: string;
  confirmDeleteStorePage: (title: string) => string;
  storePageDeleted: string;
  storePageDeleteError: string;
  storePageToggleError: string;
  addStorePage: string;
  storePageManagerTitle: string;
  storePageManagerDesc: string;
  storePageTitleLabel: string;
  storePageSlugLabel: string;
  storePageContentLabel: string;
  storePagePublished: string;
  cancelEdit: string;
  savingPage: string;
  saveEditPage: string;
  addPageButton: string;
  noStorePages: string;
  pagePublishedBadge: string;
  pageDraftBadge: string;
  pageSlugLabel: string;
  viewPage: string;
  viewPageAria: (title: string) => string;
  editPageAria: (title: string) => string;
  hidePageAria: (title: string) => string;
  publishPageAria: (title: string) => string;
  deletePageAria: (title: string) => string;
  hideAction: string;
  publishAction: string;
  editAction: string;
  deleteAction: string;
  storePageFormEditTitle: string;
  storePageFormAddTitle: string;
  storePageFormDesc: string;
  savingPageForm: string;
  savePageForm: string;
  cancelPageForm: string;
  storePageContentTitle: string;
  storePageContentDesc: string;

  // StoreUsernameManager
  storeNameAvailable: string;
  storeNameTaken: string;
  storeNameCheckError: string;
  storeUrlSaved: (username: string) => string;
  storeUrlSaveError: string;
  storeUrlTitle: string;
  storeUrlDesc: string;
  checkingLabel: string;
  checkLabel: string;
  savingLabel: string;
  saveLabel: string;

  // ThemeManager
  themeIdentityTitle: string;
  themeIdentityDesc: string;
  storeNamePlaceholderTheme: string;
  storeNameHelperTheme: string;
  primaryColorLabel: string;
  secondaryColorLabel: string;
  textColorLabel: string;
  templateAccordionTitle: string;
  templateAccordionDesc: string;
  storefrontTextAccordionTitle: string;
  storefrontTextAccordionDesc: string;
  storefrontTitleLabel: string;
  storefrontTitlePlaceholder: string;
  storefrontDescLabel: string;
  storefrontDescPlaceholder: string;
  socialLinksAccordionTitle: string;
  socialLinksAccordionDesc: string;
  storeImagesAccordionTitle: string;
  storeImagesAccordionDesc: string;
  themeSaved: string;
  themeSaveError: string;
  saveThemeButton: string;
  themePreviewLabel: string;
  bannerPreviewAlt: string;
  iconPreviewAlt: string;
  primaryButtonPreviewLabel: string;
  secondaryButtonPreviewLabel: string;
  previewTextClear: string;
  templateSelectorDesc: string;
  templateSelected: string;
  noImageYet: string;
  imageUrlOrUploadPlaceholder: string;
  uploadImageButton: string;
  storeIconLabel: string;
  storeIconHelper: string;
  storeBannerLabel: string;
  storeBannerHelper: string;
  storeCoverLabel: string;
  storeCoverHelper: string;
  whatsappLabel: string;
  instagramLabel: string;
  tiktokLabel: string;
  lineLabel: string;
  telegramLabel: string;
  xLabel: string;
  snapchatLabel: string;
  youtubeLabel: string;
  contactEmailLabel: string;
  websiteLabel: string;
  imageUploadedSaveToApply: string;
  imageUploadError2: string;

  // storefront
  storefrontTitleDefault: (name: string) => string;
  storefrontDescDefault: string;
  storefrontImageAlt: (name: string) => string;
  storefrontProfileBtn: string;
  storefrontSearchPlaceholder: string;
  storefrontSearchBtn: string;
  storefrontCategoriesLabel: string;
  storefrontAllProducts: string;
  storefrontDiscounts: string;
  storefrontRecent: string;
  storefrontAll: string;
  storefrontProductCount: (n: number) => string;
  storefrontAllProductsTitle: string;
  storefrontShowAll: string;
  storefrontNoProducts: string;
  storefrontPaginationLabel: string;
  storefrontPrevPage: string;
  storefrontNextPage: string;
  storefrontPageOf: (page: number, total: number) => string;
  storefrontUnavailableTitle: string;
  storefrontBackHome: string;
  storefrontLoadError: string;
}
