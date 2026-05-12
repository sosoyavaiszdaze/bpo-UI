/* Zynect BPO — minimal interaction
   Toggle expand/collapse for client rows.
*/
(function () {
  'use strict';

  window.toggleRow = function (row) {
    if (!row) return;
    var parent = row.parentNode;
    if (!parent) return;

    var willExpand = !row.classList.contains('expanded');

    // Collapse any other expanded row for clean focus
    Array.prototype.forEach.call(parent.querySelectorAll('.client-row.expanded'), function (r) {
      if (r !== row) r.classList.remove('expanded');
    });

    if (willExpand) row.classList.add('expanded');
    else row.classList.remove('expanded');
  };
})();
