export const generateInvoiceNumber = (companyId) => {

    const key = `invoiceCounter_${companyId}`;
  
    let counter = Number(localStorage.getItem(key)) || 0;
    counter++;
  
    localStorage.setItem(key, counter);
  
    return `INV-${String(counter).padStart(4, "0")}`;
  };