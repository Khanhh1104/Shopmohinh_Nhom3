// Phân tách dữ liệu cấu hình vào một Global Object State
const AppState = {
    products: [],
    bankInfo: {},
    siteConfig: {},
    cart: [],
    currentUser: null,
    currentPage: 1,
    perPage: 8,
    currentGalleryImages: [],
    currentGalleryIndex: 0,
    currentBanner: 0,
    bannerInterval: null
};

// Dữ liệu mặc định nếu LocalStorage trống
const defaultProducts = [
    {"id":1,"name":"RX-78-2 Gundam","category":"HG","price":350000,"originalPrice":390000,"stock":12,"status":"available","images":["https://azgundam.com/wp-content/uploads/2020/11/ENTRY-GRADE-RX-78-2-AZGUNDAM.jpg","https://azgundam.com/wp-content/uploads/2020/11/ENTRY-GRADE-RX-78-2-AZGUNDAM-2.jpg","https://azgundam.com/wp-content/uploads/2020/11/ENTRY-GRADE-RX-78-2-AZGUNDAM-4.jpg"],"video":"","desc":"Mô hình Gundam MG 1/100 MSN-001A1 Delta Plus - Bandai\nSản phẩm nhựa cao cấp với độ sắc nét cao \nSản xuất bởi Bandai Namco Nhật Bản chính hãng \nAn toàn với trẻ em \nRèn luyện tính kiên nhẫn cho người chơi"},
    {"id":2,"name":"Freedom Gundam","category":"MG","price":950000,"originalPrice":1200000,"stock":32,"status":"available","images":["https://herogame.vn/upload/images/img_06_07_2025/mo-hinh-gundam-mg-1-100-zgmf-x20a-strike-freedom-gundam-full-burst-mode-bandai-1_929608_686a3d5f6dfcf1.17467915.webp"],"video":"","desc":"Sản phẩm nhựa cao cấp với độ sắc nét cao"},
    {"id":3,"name":"Unicorn Gundam","category":"MG","price":850000,"originalPrice":980000,"stock":23,"status":"available","images":["https://herogame.vn/upload/images/img_08_05_2024/mo-hinh-gundam-mg-1-100-rx-0-full-armor-unicorn-gundam-ver-ka-bandai-1_424509_663b35022d9010.90677788.jpg"],"video":"","desc":"Sản phẩm nhựa cao cấp với độ sắc nét cao"},
    {"id":4,"name":"Strike Freedom","category":"PG","price":4200000,"originalPrice":6000000,"stock":3,"status":"available","images":["https://herogame.vn/upload/images/img_17_02_2024/mo-hinh-gundam-mgex-1-100-zgmf-x20a-strike-freedom-bandai-gdmg0028-1_222944_65d05fa452a9b5.88291114.jpg"],"video":"","desc":"An toàn với trẻ em\nRèn luyện tính kiên nhẫn cho người chơi"},
    {"id":5,"name":"Gundam Barbatos Lupus","category":"HG","price":450000,"originalPrice":450000,"stock":0,"status":"preorder","images":["https://herogame.vn/upload/images/img_17_12_2025/mo-hinh-gundam-mg-1-100-asw-g-08-gundam-barbatos-lupus-bandai-1_477340_69427f21aa9ad0.20367560.jpg"],"video":"","desc":"Sản xuất bởi Bandai Namco Nhật Bản chính hãng"},
    {"id":6,"name":"Sazabi Ver.Ka","category":"MG","price":2300000,"originalPrice":2600000,"stock":6,"status":"available","images":["https://gundamshop.vn/wp-content/uploads/2020/12/bf9edc731c7ed34f21cbae0fd4111766-600x600.jpg"],"video":"","desc":"Sản phẩm nhựa cao cấp với độ sắc nét cao"},
    {"id":8,"name":"Wing Gundam Zero EW","category":"PG","price":6000000,"originalPrice":6800000,"stock":5,"status":"available","images":["https://herogame.vn/upload/images/img_03_07_2025/mo-hinh-gundam-mg-1-100-xxxg-00w0-wing-gundam-proto-zero-ew-bandai-1_509556_68663ed655b9b8.76033834.jpg"],"video":"","desc":"Rèn luyện tính kiên nhẫn cho người chơi"},
    {"id":9,"name":"Gundam Aerial","category":"HG","price":380000,"originalPrice":420000,"stock":27,"status":"available","images":["https://herogame.vn/upload/images/img_26_09_2025/mo-hinh-gundam-mgsd-xvx-016-gundam-aerial-bandai-1_778339_68d6330eb29998.41698112.webp"],"video":"","desc":"Sản phẩm nhựa cao cấp với độ sắc nét cao"},
    {"id":13,"name":"God Gundam","category":"RG","price":800000,"originalPrice":850000,"stock":44,"status":"available","images":["https://herogame.vn/upload/images/img_08_04_2025/mo-hinh-gundam-sd-sangoku-soketsuden-gan-ning-crossbone-bandai1_332669_67f4daef17c6c8.31413169.jpg"],"video":"","desc":"Sản xuất bởi Bandai Namco Nhật Bản"},
    {"id":14,"name":"Tallgeese EW","category":"MG","price":1100000,"originalPrice":1200000,"stock":33,"status":"available","images":["https://herogame.vn/upload/images/img_10_04_2023/mo-hinh-gundam-rg-1-144-oz-00ms-tallgeese-ew-bandai-gdrg0004-1_694980_6434024a4565b8.18065750.jpg"],"video":"","desc":"An toàn với trẻ em"},
    {"id":18,"name":"Sinanju Stein","category":"RG","price":1800000,"originalPrice":1900000,"stock":41,"status":"available","images":["https://herogame.vn/upload/images/img_01_01_2026/mo-hinh-gundam-hg-1-144-msn-06s-2-sinanju-stein-narrative-ver-bandai-1_518329_69561e7f731570.18530099.webp"],"video":"","desc":"Mô hình Gundam HG 1/144"},
    {"id":19,"name":"Perfect Strike Gundam","category":"PG","price":5500000,"originalPrice":5800000,"stock":22,"status":"available","images":["https://herogame.vn/upload/images/img_07_05_2024/mo-hinh-gundam-hg-1-144-r17-gat-x105-aqm-e-ym1-gat-x105-aqm-e-ym1-perfect-strike-gundam-bandai-1_138927_6639ce66b253a0.85635058.jpg"],"video":"","desc":"Sản phẩm nhựa cao cấp với độ sắc nét cao"},
    {"id":1774241246825,"name":"Gundam Delta Plus","category":"RG","price":1200000,"originalPrice":1400000,"stock":36,"status":"available","images":["https://herogame.vn/upload/images/img_04_02_2026/mo-hinh-gundam-mg-1-100-msn-001a1-delta-plus-bandai-1_473163_69830cfd5800e1.81755243.jpg"],"video":"","desc":"Mô hình Gundam MG 1/100 MSN-001A1 Delta Plus"}
];

const defaultBankInfo = {
    "name": "MB Bank (Quân Đội)",
    "num": "0334831376",
    "owner": "PHAM HUY HIEP",
    "qr": "https://img.vietqr.io/image/MB-0334831376-compact.jpg"
};

const defaultSiteConfig = {
    "primaryColor": "#0082e6",
    "bgStyle": "https://www.chromethemer.com/download/hd-wallpapers/gundam-7680x4320.jpg",
    "banners": [
        "https://herogame.vn/upload/images/img_06_07_2025/mo-hinh-gundam-mg-1-100-zgmf-x20a-strike-freedom-gundam-full-burst-mode-bandai-1_929608_686a3d5f6dfcf1.17467915.webp",
        "https://herogame.vn/upload/images/img_03_07_2025/mo-hinh-gundam-mg-1-100-xxxg-00w0-wing-gundam-proto-zero-ew-bandai-1_509556_68663ed655b9b8.76033834.jpg"
    ]
};

// Khởi tạo State
AppState.products = JSON.parse(localStorage.getItem('products')) || defaultProducts;
AppState.bankInfo = JSON.parse(localStorage.getItem('bankInfo')) || defaultBankInfo;
AppState.siteConfig = JSON.parse(localStorage.getItem('siteConfig')) || defaultSiteConfig;
AppState.cart = JSON.parse(localStorage.getItem('cart')) || [];
AppState.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;