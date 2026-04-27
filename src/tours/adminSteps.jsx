import React from 'react';

// Route each step lives on. AdminTourController navigates before each step.
export const STEP_ROUTES = [
  '/admin',            // 0  Welcome
  '/admin',            // 1  Sidebar
  '/admin',            // 2  Overview stats
  '/admin',            // 3  Overview charts
  '/admin',            // 4  Notifications bell
  '/admin/products',   // 5  Add product btn
  '/admin/products',   // 6  Products search/filter
  '/admin/products',   // 7  Products list
  '/admin/orders',     // 8  Order status filters
  '/admin/orders',     // 9  Order search
  '/admin/orders',     // 10 Orders list
  '/admin/orders',     // 11 Bulk selection header
  '/admin/customers',  // 12 Customers list
  '/admin/reviews',    // 13 Reviews list
  '/admin/settings',   // 14 Settings tabs
  '/admin',            // 15 Done
];

function Step({ title, children }) {
  return (
    <div className="font-poppins">
      <p className="font-bold text-gray-900 text-sm mb-1.5">{title}</p>
      <p className="text-gray-500 text-xs leading-relaxed">{children}</p>
    </div>
  );
}

export const adminSteps = [
  // ── 0 Welcome ──────────────────────────────────────────────────────────────
  {
    selector: 'body',
    position: 'center',
    content: (
      <Step title="Welcome to TBSS Admin 👋">
        This quick tour walks you through everything you need to manage the
        bookstore — products, orders, customers, and more. Click <strong>Next</strong> to
        begin or <strong>✕</strong> to skip.
      </Step>
    ),
  },

  // ── 1 Sidebar ──────────────────────────────────────────────────────────────
  {
    selector: '[data-tour="admin-sidebar"]',
    position: 'right',
    mutationObservables: ['[data-tour="admin-sidebar"]'],
    content: (
      <Step title="Navigation Sidebar">
        Every section of the admin panel lives here. Click the hamburger icon
        at the top to collapse the sidebar to icon-only mode and save screen
        space.
      </Step>
    ),
  },

  // ── 2 Overview stats ───────────────────────────────────────────────────────
  {
    selector: '[data-tour="overview-stats"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="overview-stats"]'],
    content: (
      <Step title="Dashboard Metrics">
        At a glance: total revenue, orders placed, registered customers, and
        low-stock alerts. Click <strong>Refresh</strong> in the top-right to
        pull the latest data.
      </Step>
    ),
  },

  // ── 3 Overview charts ──────────────────────────────────────────────────────
  {
    selector: '[data-tour="overview-charts"]',
    position: 'top',
    mutationObservables: ['[data-tour="overview-charts"]'],
    content: (
      <Step title="Revenue &amp; Order Charts">
        Revenue trends over time, order volume by status, and an order
        breakdown pie chart. Hover any data point for exact figures.
      </Step>
    ),
  },

  // ── 4 Notifications ────────────────────────────────────────────────────────
  {
    selector: '[data-tour="notifications-bell"]',
    position: 'bottom',
    content: (
      <Step title="Real-time Notifications">
        New orders, low-stock warnings, and payment events arrive here
        instantly. The orange dot shows the unread count. Click{' '}
        <strong>Mark all as read</strong> to clear it.
      </Step>
    ),
  },

  // ── 5 Products — add button ────────────────────────────────────────────────
  {
    selector: '[data-tour="products-add-btn"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="products-add-btn"]'],
    content: (
      <Step title="Add a New Product">
        Opens the product form. Fill in title, author, genre, price, stock
        quantity, and upload a cover image directly from your computer.
        ISBN and description are optional but recommended.
      </Step>
    ),
  },

  // ── 6 Products — search / filter ──────────────────────────────────────────
  {
    selector: '[data-tour="products-search"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="products-search"]'],
    content: (
      <Step title="Search &amp; Filter Products">
        Search by title or author, filter by genre or stock status, and sort
        any column. Use the <strong>Export</strong> button to download the
        full catalogue as a CSV file.
      </Step>
    ),
  },

  // ── 7 Products — list ─────────────────────────────────────────────────────
  {
    selector: '[data-tour="products-list"]',
    position: 'top',
    mutationObservables: ['[data-tour="products-list"]'],
    content: (
      <Step title="Product Catalogue">
        Each row shows the cover, title, genre, price, and stock level. Click
        the <strong>pencil icon</strong> to edit or the{' '}
        <strong>trash icon</strong> to delete. Stock status turns amber when
        below 5 units.
      </Step>
    ),
  },

  // ── 8 Orders — status filters ─────────────────────────────────────────────
  {
    selector: '[data-tour="orders-status-filters"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="orders-status-filters"]'],
    content: (
      <Step title="Order Status Filters">
        Filter orders by lifecycle stage: <strong>Pending</strong> (awaiting
        payment), <strong>Paid</strong>, <strong>Processing</strong>,{' '}
        <strong>Shipped</strong>, <strong>Delivered</strong>, or{' '}
        <strong>Cancelled</strong>. Counts update live.
      </Step>
    ),
  },

  // ── 9 Orders — search ─────────────────────────────────────────────────────
  {
    selector: '[data-tour="orders-search"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="orders-search"]'],
    content: (
      <Step title="Search Orders">
        Look up by customer name, email, or order reference ID. Combine with
        the status filter above for precise results.
      </Step>
    ),
  },

  // ── 10 Orders — list ──────────────────────────────────────────────────────
  {
    selector: '[data-tour="orders-list"]',
    position: 'top',
    mutationObservables: ['[data-tour="orders-list"]'],
    content: (
      <Step title="Order Management">
        Expand any order row to see line items, shipping address, and payment
        info. Change the status from the dropdown on the right of each row —
        for <strong>Shipped</strong> you can add a tracking URL, for{' '}
        <strong>Cancelled</strong> a reason is required.
      </Step>
    ),
  },

  // ── 11 Orders — bulk select ───────────────────────────────────────────────
  {
    selector: '[data-tour="orders-bulk-header"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="orders-bulk-header"]'],
    content: (
      <Step title="Bulk Status Updates">
        Tick the checkbox here to select all visible orders, or tick individual
        rows. A dark action bar appears at the top — choose a status and apply
        it to all selected orders in one click.
      </Step>
    ),
  },

  // ── 12 Customers ──────────────────────────────────────────────────────────
  {
    selector: '[data-tour="customers-list"]',
    position: 'top',
    mutationObservables: ['[data-tour="customers-list"]'],
    content: (
      <Step title="Customer Accounts">
        View every registered customer. You can{' '}
        <strong>suspend</strong> an account (user can't log in),{' '}
        <strong>re-activate</strong> it, or{' '}
        <strong>permanently delete</strong> it. Email verification status is
        shown on each row.
      </Step>
    ),
  },

  // ── 13 Reviews ────────────────────────────────────────────────────────────
  {
    selector: '[data-tour="reviews-list"]',
    position: 'top',
    mutationObservables: ['[data-tour="reviews-list"]'],
    content: (
      <Step title="Review Moderation">
        Customer reviews wait here before going live. Approve a review to
        publish it on the product page; reject to hide it. The product's
        average star rating updates automatically.
      </Step>
    ),
  },

  // ── 14 Settings & Staff ───────────────────────────────────────────────────
  {
    selector: '[data-tour="settings-tabs"]',
    position: 'bottom',
    mutationObservables: ['[data-tour="settings-tabs"]'],
    content: (
      <Step title="Settings — Staff &amp; Audit Log">
        Three tabs here: <strong>Profile</strong> (your own account),{' '}
        <strong>Staff</strong> (invite admins by email, revoke access), and{' '}
        <strong>Audit Log</strong> (full history of every admin action with
        timestamps).
      </Step>
    ),
  },

  // ── 15 Done ───────────────────────────────────────────────────────────────
  {
    selector: 'body',
    position: 'center',
    content: (
      <Step title="You're all set! 🎉">
        That's the full tour. Click the <strong>?</strong> button in the
        top-right any time to replay it. Reach out to your Superadmin if you
        need access to restricted sections.
      </Step>
    ),
  },
];
