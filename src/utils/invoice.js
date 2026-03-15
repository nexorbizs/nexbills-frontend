<<<<<<< HEAD
export const generateInvoiceNumber = (companyId) => {

    const key = `invoiceCounter_${companyId}`;
  
    let counter = Number(localStorage.getItem(key)) || 0;
    counter++;
  
    localStorage.setItem(key, counter);
  
    return `INV-${String(counter).padStart(4, "0")}`;
=======
export const generateInvoiceNumber = (companyId) => {

    const key = `invoiceCounter_${companyId}`;
  
    let counter = Number(localStorage.getItem(key)) || 0;
    counter++;
  
    localStorage.setItem(key, counter);
  
    return `INV-${String(counter).padStart(4, "0")}`;
>>>>>>> 479c1c5f3a0fe0426cba61fe2c2eecef4c23e0a9
  };