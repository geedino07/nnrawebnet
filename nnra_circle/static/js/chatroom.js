const leftmost = document.querySelector('.left-most-tile')
const modalOverlay = document.querySelector('.modal-overlay')

function toggleLeftMostTile(){
    modalOverlay.classList.toggle('visible')
    leftmost.classList.toggle('visible')
}