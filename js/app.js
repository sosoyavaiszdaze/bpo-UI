/* Zynect BPO — minimal interaction layer
   Row expand / collapse for tables.
*/
(function () {
  'use strict';

  window.toggleRow = function (tr) {
    if (!tr) return;
    var next = tr.nextElementSibling;
    var isDetail = next && next.classList && next.classList.contains('row-detail-tr');

    // Toggle expanded state on the main row
    var willExpand = !tr.classList.contains('expanded');

    // Collapse all other expanded rows in the same table for clean focus
    var tbody = tr.parentNode;
    if (tbody) {
      Array.prototype.forEach.call(tbody.querySelectorAll('tr.expanded'), function (r) {
        if (r !== tr) {
          r.classList.remove('expanded');
          var d = r.nextElementSibling;
          if (d && d.classList.contains('row-detail-tr')) d.style.display = 'none';
        }
      });
    }

    if (willExpand) {
      tr.classList.add('expanded');
      if (isDetail) next.style.display = '';
    } else {
      tr.classList.remove('expanded');
      if (isDetail) next.style.display = 'none';
    }
  };

  // Initialize: hide all detail rows except those whose parent starts as .expanded
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('tr.row-detail-tr'), function (dr) {
      var prev = dr.previousElementSibling;
      if (!prev || !prev.classList.contains('expanded')) {
        dr.style.display = 'none';
      }
    });
  });
})();
