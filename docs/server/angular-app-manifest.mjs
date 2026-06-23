
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/NearFix/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/home"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/WhoUs"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/join-us"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/our-services"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/artisan-profile/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/OrderService/*"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/ClientOrder"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/client-profile"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/artisan-available-jobs"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-CTM5HTAU.js"
    ],
    "route": "/NearFix/update-artisan-profile"
  },
  {
    "renderMode": 2,
    "route": "/NearFix/Auth"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QD5XEOAO.js",
      "chunk-N6C6GDUF.js",
      "chunk-4ODFPTTC.js"
    ],
    "route": "/NearFix/Auth/Login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QD5XEOAO.js",
      "chunk-D36QEZKI.js",
      "chunk-4ODFPTTC.js",
      "chunk-LPFG4QMK.js"
    ],
    "route": "/NearFix/Auth/Register"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QD5XEOAO.js",
      "chunk-4QIYKN6H.js",
      "chunk-4ODFPTTC.js",
      "chunk-LPFG4QMK.js"
    ],
    "route": "/NearFix/Auth/artisan-signup"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QD5XEOAO.js",
      "chunk-5BMUTR3A.js"
    ],
    "route": "/NearFix/Auth/RoleSelection"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-QD5XEOAO.js",
      "chunk-DIGJGDR6.js"
    ],
    "route": "/NearFix/Auth/PendingApproval"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-I5PH2QHO.js"
    ],
    "route": "/NearFix/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 30215, hash: '45c17b74b5e9a81e6c34b4f583bf10951418d3adcea4b99c4d2ec77c7b6066e2', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1159, hash: '8e3dca2d09d68f29b643724a15d80c735bb3101491cd197ff70a3f1e89a17a42', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 261, hash: '8e3a857af1f9ed7db1b5fd5d9959440ba83237b6b4252b46373dadc1df5769d9', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 76586, hash: '09d4e7ed45fd70809390b7a599377dfa065396d2591e142ee36de9931c08ad81', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'Auth/Login/index.html': {size: 36580, hash: 'e9c5e34155b6ad9b49de292b73ea9872e039c84375c76300923d309aa9beeefa', text: () => import('./assets-chunks/Auth_Login_index_html.mjs').then(m => m.default)},
    'Auth/PendingApproval/index.html': {size: 35620, hash: '160cdb10873104664b2b9920c66e595715777f8d88902070b4d944ea533ba576', text: () => import('./assets-chunks/Auth_PendingApproval_index_html.mjs').then(m => m.default)},
    'Auth/artisan-signup/index.html': {size: 57309, hash: '958a47ed2743cea366e0219ee3cce954594aeb91c79ae2de0d8dab3086573a95', text: () => import('./assets-chunks/Auth_artisan-signup_index_html.mjs').then(m => m.default)},
    'join-us/index.html': {size: 94372, hash: '1796f20eadb0fa02caaafc522d654ec68359c879a4a4c39eca834011674059b0', text: () => import('./assets-chunks/join-us_index_html.mjs').then(m => m.default)},
    'Auth/index.html': {size: 30391, hash: 'e7a390a948805d95e4a4f29374cacbb0dad13112239f657c64c395a7a58f6d2d', text: () => import('./assets-chunks/Auth_index_html.mjs').then(m => m.default)},
    'Auth/RoleSelection/index.html': {size: 47672, hash: 'd2fc83842f71bf472a5fa179927c5822b06160d97f04797864433e11b21cfba3', text: () => import('./assets-chunks/Auth_RoleSelection_index_html.mjs').then(m => m.default)},
    'our-services/index.html': {size: 71274, hash: 'f2b5706b9c036b58be2ca0fa8b3337b0d7accf73a858147b3b026f1baa40b546', text: () => import('./assets-chunks/our-services_index_html.mjs').then(m => m.default)},
    'Auth/Register/index.html': {size: 37280, hash: 'f4737265f748d07b8766a066ff673956a09b72fa39a8a7b4a8bb7085ebcff881', text: () => import('./assets-chunks/Auth_Register_index_html.mjs').then(m => m.default)},
    'ClientOrder/index.html': {size: 279, hash: '2578ef1c40ab999257cc3fd881b33f26c0ce5f7185c25567d17060926f7a75b6', text: () => import('./assets-chunks/ClientOrder_index_html.mjs').then(m => m.default)},
    'client-profile/index.html': {size: 279, hash: '2578ef1c40ab999257cc3fd881b33f26c0ce5f7185c25567d17060926f7a75b6', text: () => import('./assets-chunks/client-profile_index_html.mjs').then(m => m.default)},
    'WhoUs/index.html': {size: 82496, hash: 'bdea3b15e5ff1f545e3479bb1c492b13780f2278f6722d1ae6650fbe1cea31db', text: () => import('./assets-chunks/WhoUs_index_html.mjs').then(m => m.default)},
    'artisan-available-jobs/index.html': {size: 279, hash: '2578ef1c40ab999257cc3fd881b33f26c0ce5f7185c25567d17060926f7a75b6', text: () => import('./assets-chunks/artisan-available-jobs_index_html.mjs').then(m => m.default)},
    'update-artisan-profile/index.html': {size: 279, hash: '2578ef1c40ab999257cc3fd881b33f26c0ce5f7185c25567d17060926f7a75b6', text: () => import('./assets-chunks/update-artisan-profile_index_html.mjs').then(m => m.default)},
    'styles-IBV4BH7Z.css': {size: 164283, hash: 'Du/T5rN0pUA', text: () => import('./assets-chunks/styles-IBV4BH7Z_css.mjs').then(m => m.default)}
  },
};
