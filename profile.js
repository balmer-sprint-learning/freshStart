// Event listener for 'blur' on the nickname field
document.getElementById('nickname').addEventListener('blur', generateLicenceNumber);

// Event listener for 'blur' on the version field
document.getElementById('version').addEventListener('blur', generateUserPrefix);


// =================================================



// Function to calculate and insert the licence number
function generateLicenceNumber() {
  const nickname = document.getElementById('nickname').value;
  const licenceValue = nickname + "-T1-7K-025";
  document.getElementById('licence').value = licenceValue; 
}

function generateUserPrefix() {
  const nickname = document.getElementById('nickname').value || '';
  // Use Crypto API for 8-digit random number (decimals 10000000 to 99999999)
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomNum = (array % 90000000) + 10000000; // Always 8 digits

  document.getElementById('prefix').value = nickname + '-2510-' + randomNum;
}


































































































































































