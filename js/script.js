document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const counterElement = document.getElementById('server-counter');
    const logoutBtn = document.getElementById('logout-btn');

    const targetCount = 50;
    let count = 0;

    const increment = () => {
        if (count < targetCount) {
            count++;
            const displayCount = count === targetCount ? `${count}+` : count;
            counterElement.innerHTML = `I have already been added to <span class="number-font">${displayCount}</span> servers!`;
            setTimeout(increment, 50);
        } else {
            counterElement.innerHTML = `I have already been added to <span class="number-font">${targetCount}+ </span> servers!`;
        }
    };
    increment();

    function replaceNumbersWithSpans(element) {
        element.innerHTML = element.innerHTML.replace(/(\d+)/g, '<span class="number-font">$1</span>');
    }

    replaceNumbersWithSpans(counterElement);
    document.querySelectorAll('.donor-amount').forEach(replaceNumbersWithSpans);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const intro = document.querySelector('.intro');
    const buttons = document.querySelectorAll('.buttons a');
    const textBlocks = document.querySelectorAll('.text-block');
    const donorList = document.querySelector('.donor-list');
    const donorSection = document.querySelector('.donor-list h2');
    const donors = document.querySelectorAll('.donor');

    if (intro) observer.observe(intro);
    buttons.forEach(button => observer.observe(button));
    textBlocks.forEach(block => observer.observe(block));
    if (donorList) observer.observe(donorList);
    if (donorSection) observer.observe(donorSection);
    donors.forEach(donor => observer.observe(donor));

    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            console.log('User data received:', data);
            if (data.loggedIn) {
                loginBtn.style.display = 'none';
                userInfo.style.display = 'flex';
                const avatarUrl = data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : 'path/to/default/avatar.png';
                userAvatar.src = avatarUrl;
                userName.textContent = data.username;
            } else {
                loginBtn.style.display = 'block';
                userInfo.style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching user data:', error));

    let lastScrollTop = 0;
    let isScrolling = false;

    const updateHeaderStyles = () => {
        const scrollTop = window.scrollY;

        const header = document.querySelector('header');
        if (scrollTop > lastScrollTop) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
            if (scrollTop > 0) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateHeaderStyles();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    const smoothScrollToElement = (element) => {
        window.scrollTo({
            top: element.offsetTop,
            behavior: 'smooth'
        });
    };

    document.querySelector('.scroll-to-donors').addEventListener('click', function (event) {
        event.preventDefault();
        smoothScrollToElement(donorList);
    });

    const toggleVisibility = (element) => {
        if (element.style.display === 'none' || element.style.display === '') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    };

    document.querySelector('.toggle-donors').addEventListener('click', function (event) {
        event.preventDefault();
        toggleVisibility(donorList);
    });

    document.getElementById('addMeBtn').addEventListener('click', function (event) {
        event.preventDefault();
        const url = "https://discord.com/oauth2/authorize?client_id=1256968181180928080&permissions=1126468990921793&integration_type=0&scope=bot";
        window.open(url, '_blank', 'width=500,height=700');
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', function (event) {
            event.preventDefault();
            const url = "/auth/discord";
            const authWindow = window.open(url, '_blank', 'width=500,height=700');

            const checkAuthWindowClosed = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(checkAuthWindowClosed);
                    fetch('/api/user')
                        .then(response => response.json())
                        .then(data => {
                            if (data.loggedIn) {
                                loginBtn.style.display = 'none';
                                userInfo.style.display = 'flex';
                                const avatarUrl = data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : 'path/to/default/avatar.png';
                                userAvatar.src = avatarUrl;
                                userName.textContent = data.username;
                            } else {
                                loginBtn.style.display = 'block';
                                userInfo.style.display = 'none';
                            }
                        })
                        .catch(error => console.error('Error fetching user data:', error));
                }
            }, 1000);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            fetch('/api/user', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
                .then(response => {
                    if (response.ok) {
                        loginBtn.style.display = 'block';
                        userInfo.style.display = 'none';
                        window.location.href = '/';
                    } else {
                        console.error('Logout failed:', response.statusText);
                    }
                })
                .catch(error => console.error('Error during logout:', error));
        });
    }

    window.addEventListener('message', (event) => {
        if (event.data === 'auth-success') {
            window.location.reload();
        }
    });
});
