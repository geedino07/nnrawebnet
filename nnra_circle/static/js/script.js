const mobile = document.querySelector('.mobile')
const closeNav = document.querySelector('.close-nav')
const nav = document.querySelector('.el-two')

function showNav(){
    nav.classList.add('visible')
}

function closeNavbar(){
    nav.classList.remove('visible')
}
mobile.addEventListener('click', showNav)
closeNav.addEventListener('click', closeNavbar)



