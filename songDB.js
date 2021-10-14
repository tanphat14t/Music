const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'f8-player'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}, 
    songs: [
        {
            name: 'Đô Trưởng',
            singer: 'Đạt G',
            path: './assets/music/dotruong.mp3',
            image: './assets/img/dotruong.jpg'
        },
        {
            name: 'Khuê Mộc Lan',
            singer: 'Hương Ly ft',
            path: './assets/music/khuemoclan.mp3',
            image: './assets/img/khuemoclan.jpg'
        },
        {
            name: 'Thêm Bao Nhiêu Lâu',
            singer: 'Đạt G',
            path: './assets/music/thembaonhieulau.mp3',
            image: './assets/img/thembaonhieulau.jpg'
        },
        {
            name: 'Yêu Là Cưới',
            singer: 'X2X',
            path: './assets/music/yeulacuoi.mp3',
            image: './assets/img/yeulacuoi.jpg'
        },
        {
            name: 'Shape Of You',
            singer: 'Đạt G',
            path: './assets/music/shapeofyou.mp3',
            image: './assets/img/shapeofyou.jpg'
        },
        {
            name: 'Monster',
            singer: 'Đạt G',
            path: './assets/music/monster.mp3',
            image: './assets/img/monster.jpg'
        },
        {
            name: 'Mình Anh Nơi Này',
            singer: 'Đạt G',
            path: './assets/music/minhanhnoinay.mp3',
            image: './assets/img/minhanhnoinay.jpg'
        },
        {
            name: 'The River',
            singer: 'Đạt G',
            path: './assets/music/theriver.mp3',
            image: './assets/img/theriver.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })
        playlist.innerHTML = htmls.join('\n');

    },
    defindProperty: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth

        //xử lý cd quay/ dừng 

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        //xử lý kích thước cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //xử lý khi clich play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }


        //khi bài hát đc phát 
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //khi bài hát dừng 
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause();

        }

        //khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const currentPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = currentPercent
            }
        }
        //xử lý tua bài hát thay
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }


        //khi next bài hát
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong();
        }
        //khi prev bài hát
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong();
        }
        //khi nhấn nút random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle("active", _this.isRandom)
        }
        //xử lý lặp lại bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle("active", _this.isRepeat)
        }
        //xử lý chuyển bài
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click();
            }
        }
        //hành vi bấm vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (
                songNode && !e.target.closest('.option')) {
                //xử lý khi click vào bài hát
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if (e.target.closest('.option')) {

                }
            }
        }

    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        console.log(heading, cdThumb, audio)
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 500)
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while
            (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong();
    },

    start: function () {
        //gán cáu hình từ config
        this.loadConfig();
        //định nghĩa các thuộc tính
        this.defindProperty();

        //lắng nghe và xử lý sự kiện
        this.handleEvent();

        //tải bài hát vào giao diện ứng dụng
        this.loadCurrentSong();

        //render playlist
        this.render();

        //hiển thị trạng thái ban đầu của btn random và repeat
        randomBtn.classList.toggle("active", _this.isRandom)
        repeatBtn.classList.toggle("active", _this.isRepeat)
    }

}
app.start()