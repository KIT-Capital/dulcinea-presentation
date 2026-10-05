import assert from 'node:assert/strict';

// Match the existing isolated Workers exactly. Extra service or storage bindings
// require an intentional policy update; a site release never supplies secrets.
export function assertDeploymentTarget(config, mode) {
  assert.ok(['production', 'review'].includes(mode), 'Unknown deployment target');
  const production = mode === 'production';
  assert.deepEqual(config, {
    name: production ? 'dulcinea-investor-presentation' : 'dulcinea-design-review',
    account_id: '691c05eedd282317f3311e441d77a007',
    main: production ? 'server/worker.mjs' : 'server/review-worker.mjs',
    compatibility_date: '2026-09-26',
    workers_dev: !production,
    preview_urls: false,
    routes: production ? [{pattern:'invest.dulcineainvestments.org',custom_domain:true}] : [],
    assets: {
      directory: './dist/private-site',
      binding: 'ASSETS',
      run_worker_first: true,
      html_handling: 'none',
      not_found_handling: '404-page',
    },
    vars: production ? {PREVIEW_ONLY:'false'} : {PREVIEW_ONLY:'false',REVIEW_SITE:'true',REVIEW_PUBLIC:'true'},
    ratelimits: production
      ? [{name:'LOGIN_LIMITER',namespace_id:'92620261',simple:{limit:8,period:60}}]
      : [{name:'LOGIN_LIMITER',namespace_id:'92620301',simple:{limit:8,period:60}},
         {name:'REVIEW_LIMITER',namespace_id:'92620302',simple:{limit:8,period:60}}],
    observability: {enabled:false},
  }, `${mode} deployment target differs from the approved Worker configuration`);
}
