const mobile = document.querySelector('.mobile')
const closeNav = document.querySelector('.close-nav')
const nav = document.querySelector('.el-two')



mobile.addEventListener('click', showNav)
closeNav.addEventListener('click', closeNavbar)


function showNav(){
    nav.classList.add('visible')
}

function closeNavbar(){
    nav.classList.remove('visible')
}