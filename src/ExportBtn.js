import $ from 'jquery';
import { TableExport } from './exportLib/tableExport.js';

export default {
  mounted() {
    $(document)
      .unbind()
      .on('click', '.exportbtn', function() {
        exportTableToExcel();
      });
  },
  render(h) {
    return h(
      'button',
      {
        staticClass: ['exportbtn'],
        attrs: {
          role: 'button',
        },
      },
      'Export to Excel'
    );
  },
};

function exportTableToExcel() {
  var options = {
    tableName: 'Table name',
  };
  var params = { fileName: 'report', type: 'excel', mso: { fileFormat: 'xlsx' } };

  $.extend(true, options, params);
  TableExport.export($('.pvtTable').attr('border', '1'), options);
}
