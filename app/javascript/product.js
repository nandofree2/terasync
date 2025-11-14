document.addEventListener('DOMContentLoaded', function() {
  const productModalEl = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const saveBtn = document.getElementById('saveProduct');
  const productModal = new bootstrap.Modal(productModalEl);
  const productsTbody = document.getElementById('productsTbody');
  const addBtn = document.getElementById('btnAddProduct');
  const formErrors = document.getElementById('formErrors');
  let deleteTargetId = null;

    // Open add product modal
  addBtn.addEventListener('click', function() {
    formErrors.classList.add('d-none');
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = 'Add Product';
    productModal.show();
  });

  // Helper: render row
  function renderRow(p) {
    return `
      <tr data-id="${p.id}">
        <td>${p.id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.sku || '')}</td>
        <td class="text-end">${formatCurrency(p.price)}</td>
        <td class="text-end">${p.stock}</td>
        <td>${escapeHtml(p.status || '')}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `;
  }
   // Populate initial via fetch (assumes GET /products.json returns array)
  function loadProducts() {
    fetch('/products.json', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          productsTbody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No products yet.</td></tr>';
          updateStats([]);
          return;
        }
        productsTbody.innerHTML = data.map(renderRow).join('');
        updateStats(data);
      })
      .catch(e => {
        console.warn('loadProducts', e);
      });
  }
  loadProducts();

  // Stats
  function updateStats(list) {
    document.getElementById('statTotal').textContent = list.length;
    document.getElementById('statActive').textContent = list.filter(x=>x.status==='active').length;
    document.getElementById('statLow').textContent = list.filter(x=>Number(x.stock)<=5).length;
    const totalValue = list.reduce((s,p)=> s + (Number(p.price||0) * Number(p.stock||0)), 0);
    document.getElementById('statValue').textContent = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(totalValue);
  }
  // Submit create/update via fetch (expects JSON response)
  productForm.addEventListener('submit', function(ev) {
    ev.preventDefault();
    formErrors.classList.add('d-none');
    const formData = new FormData(productForm);
    const payload = {};
    formData.forEach((v,k) => payload[k] = v);

    // basic client validation
    if (!payload.name || !payload.price || !payload.stock) {
      showFormErrors(['Name, price and stock are required']);
      return;
    }

    const id = payload.id || '';
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/products/${id}.json` : '/products.json';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      credentials: 'same-origin',
      body: JSON.stringify({ product: payload })
    })
    .then(async res => {
      const json = await res.json().catch(()=>null);
      if (res.ok) {
        // update table: reload or upsert
        // simple: reload all
        productModal.hide();
        loadProducts();
      } else {
        const errs = json?.errors || json || ['Server validation failed'];
        showFormErrors(errs);
      }
    })
    .catch(err => {
      showFormErrors(['Network error']);
      console.error(err);
    });
  });

  function showFormErrors(messages) {
    formErrors.classList.remove('d-none');
    if (Array.isArray(messages)) formErrors.innerHTML = messages.map(m=>`<div>${escapeHtml(m)}</div>`).join('');
    else formErrors.innerHTML = `<div>${escapeHtml(messages)}</div>`;
  }

  // Edit / Delete buttons (delegation)
  document.addEventListener('click', function(e) {
    const editBtn = e.target.closest('.btn-edit');
    const delBtn = e.target.closest('.btn-delete');
    if (editBtn) {
      const id = editBtn.dataset.id;
      // fetch product detail
      fetch(`/products/${id}.json`, { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : Promise.reject('not found'))
        .then(p => {
          document.getElementById('productId').value = p.id;
          document.getElementById('productName').value = p.name;
          document.getElementById('productSku').value = p.sku || '';
          document.getElementById('productPrice').value = p.price || 0;
          document.getElementById('productStock').value = p.stock || 0;
          document.getElementById('productStatus').value = p.status || 'active';
          document.getElementById('productDesc').value = p.description || '';
          document.getElementById('productModalTitle').textContent = 'Edit Product';
          formErrors.classList.add('d-none');
          productModal.show();
        }).catch(console.error);
      return;
    }
    if (delBtn) {
      deleteTargetId = delBtn.dataset.id;
      new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
      return;
    }
  });

  // confirm delete
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', function() {
    if (!deleteTargetId) return;
    fetch(`/products/${deleteTargetId}.json`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
      credentials: 'same-origin'
    })
    .then(r => {
      if (r.ok) {
        loadProducts();
        bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
      } else {
        console.warn('delete failed');
      }
    })
    .catch(console.error);
  });


  // utils
  function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function formatCurrency(n) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0)); }
});