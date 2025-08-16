import * as XLSX from 'xlsx';

interface ExportOptions {
  title?: string;
  subtitle?: string;
  additionalInfo?: { [key: string]: string };
  sheetName?: string;
}

/**
 * Xuất dữ liệu ra file Excel với tiêu đề và thông tin bổ sung
 * @param data Dữ liệu cần xuất
 * @param fileName Tên file (không cần đuôi .xlsx)
 * @param options Tùy chọn xuất file (tiêu đề, thông tin bổ sung)
 */
export function exportToExcel(data: Record<string, string | number | null>[], fileName: string, options?: ExportOptions): void {
  try {
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Chuẩn bị dữ liệu với tiêu đề và thông tin bổ sung
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { worksheet, lastRow } = createWorksheetWithHeaders(data, options);
    
    // Tự động điều chỉnh độ rộng cột
    const columnWidths = calculateColumnWidths(data, options);
    worksheet['!cols'] = columnWidths.map(width => ({ wch: width }));
    
    // Thêm worksheet vào workbook
    const sheetName = options?.sheetName || 'Dữ liệu';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất file Excel:', error);
    throw error;
  }
}

/**
 * Tạo worksheet với tiêu đề và thông tin bổ sung
 */
function createWorksheetWithHeaders(data: Record<string, string | number | null>[], options?: ExportOptions): { worksheet: XLSX.WorkSheet, lastRow: number } {
  // Tạo worksheet trống
  const worksheet: XLSX.WorkSheet = {};
  let rowIndex = 0;
  
  // Thêm tiêu đề chính nếu có
  if (options?.title) {
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = { 
      t: 's', 
      v: options.title,
      s: { font: { bold: true, sz: 16 } }
    };
    rowIndex++;
  }
  
  // Thêm tiêu đề phụ nếu có
  if (options?.subtitle) {
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = { 
      t: 's', 
      v: options.subtitle,
      s: { font: { bold: true, sz: 12 } }
    };
    rowIndex++;
  }
  
  // Thêm thông tin bổ sung nếu có
  if (options?.additionalInfo) {
    Object.entries(options.additionalInfo).forEach(([key, value]) => {
      worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = { t: 's', v: `${key}:` };
      worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })] = { t: 's', v: value };
      rowIndex++;
    });
  }
  
  // Thêm dòng trống
  rowIndex++;
  
  // Thêm dữ liệu chính
  if (data.length > 0) {
    // Lấy tên các cột
    const headers = Object.keys(data[0]);
    
    // Thêm tiêu đề cột
    headers.forEach((header, colIndex) => {
      worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { 
        t: 's', 
        v: header,
        s: { font: { bold: true }, fill: { fgColor: { rgb: "EEEEEE" } } }
      };
    });
    rowIndex++;
    
    // Thêm dữ liệu
    data.forEach((row) => {
      headers.forEach((header, colIndex) => {
        const cellValue = row[header];
        worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { 
          t: typeof cellValue === 'number' ? 'n' : 's', 
          v: cellValue ?? 'N/A'
        };
      });
      rowIndex++;
    });
  }
  
  // Đặt phạm vi dữ liệu
  const range = { s: { c: 0, r: 0 }, e: { c: data.length > 0 ? Object.keys(data[0]).length - 1 : 0, r: rowIndex - 1 } };
  worksheet['!ref'] = XLSX.utils.encode_range(range);
  
  return { worksheet, lastRow: rowIndex };
}

/**
 * Tính toán độ rộng tự động cho các cột
 */
function calculateColumnWidths(data: Record<string, string | number | null>[], options?: ExportOptions): number[] {
  if (!data || data.length === 0) return [];
  
  // Lấy tên các cột
  const columnNames = Object.keys(data[0]);
  
  // Khởi tạo mảng độ rộng với độ rộng của tên cột
  const columnWidths = columnNames.map(name => Math.min(50, name.length + 2));
  
  // Tính độ rộng cho tiêu đề và thông tin bổ sung
  if (options?.title) {
    columnWidths[0] = Math.max(columnWidths[0], options.title.length + 5);
  }
  
  if (options?.subtitle) {
    columnWidths[0] = Math.max(columnWidths[0], options.subtitle.length + 5);
  }
  
  if (options?.additionalInfo) {
    Object.entries(options.additionalInfo).forEach(([key, value]) => {
      columnWidths[0] = Math.max(columnWidths[0], key.length + 2);
      if (columnWidths[1]) {
        columnWidths[1] = Math.max(columnWidths[1], String(value).length + 2);
      }
    });
  }
  
  // Duyệt qua từng dòng dữ liệu để tính toán độ rộng
  data.forEach(row => {
    columnNames.forEach((name, index) => {
      const cellValue = row[name]?.toString() || '';
      const cellWidth = Math.min(50, cellValue.length + 2); // Giới hạn độ rộng tối đa là 50
      columnWidths[index] = Math.max(columnWidths[index], cellWidth);
    });
  });
  
  return columnWidths;
}
