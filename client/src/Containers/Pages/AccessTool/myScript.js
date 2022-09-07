
let DomainName = window.location.hostname;
let FinalDomain = DomainName;

if (DomainName === '') {
    alert('Please Refresh')
} else if (DomainName.includes('www')) {
    const splitName = DomainName.split('.')
    const edit = splitName.shift()
    FinalDomain = splitName.join('.')
} else {
    console.log(" Final Domain Name :", FinalDomain);
    console.log(" SiteKey : ", window.interdeal.sitekey);
    console.log(" User ID : ", window.interdeal.userId);
    const siteKey = window.interdeal.sitekey
    const siteUserId = window.interdeal.userId


    const RunTheTask = async () => {
        const resp = await fetch('https://plugin-nodejs-server.herokuapp.com/api/isValidScript', {
            method: 'POST',
            body: JSON.stringify({ domainName: FinalDomain, userId: siteUserId, siteKey: siteKey }
            ),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            console.log("response By API ===", res)
        }).catch((e) => console.log("Error in Connecting to the API", e))
    }
    RunTheTask()

}




// // ================ Final ================

// let outerCircle = document.createElement('div');
// outerCircle.classList.add('script-circle');
// outerCircle.style.zIndex='9999';
// outerCircle.style.backgroundColor = 'red';
// outerCircle.style.position = 'fixed';
// outerCircle.style.bottom = '5%';
// outerCircle.style.left = '5%';
// outerCircle.style.height = '50px';
// outerCircle.style.width = '50px';
// outerCircle.style.borderRadius = '50%';
// let inner = document.createElement('p')
// inner.style.display = 'flex';
// inner.style.alignItems = 'center';
// outerCircle.append(inner);
// document.body.appendChild(outerCircle);