const SHEETDB_URL = "https://sheetdb.io/api/v1/YOUR_API_ID"; // Replace with your SheetDB ID

async function loginInvestor() {
    const investorID = document.getElementById('investor-id').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${SHEETDB_URL}/search?InvestorID=${investorID}`);
        const data = await response.json();
        
        if (data.length > 0 && data[0].AccessKey === password) {
            sessionStorage.setItem('omkar_user', JSON.stringify(data[0]));
            window.location.href = 'investor-dashboard.html';
        } else {
            alert("Invalid Credentials. Please contact care@omkarservices.in");
        }
    } catch (error) {
        console.error("Auth Error:", error);
    }
}
