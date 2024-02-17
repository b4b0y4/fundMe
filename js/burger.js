document.addEventListener('DOMContentLoaded', function () {
    const burgerMenuButton = document.querySelector('.burger-menu-button')
    const panel = document.getElementById('panel')
    const closeButton = document.querySelector('.close-button')
    const overlay = document.getElementById('overlay')

    burgerMenuButton.addEventListener('click', function () {
        panel.classList.toggle('open')
        overlay.style.display = "block"
    })

    closeButton.addEventListener('click', function () {
        panel.classList.remove('open')
        overlay.style.display = "none"
    })
})
