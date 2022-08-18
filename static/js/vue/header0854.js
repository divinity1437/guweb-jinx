var headerObj = new Vue({
    name: 'navbar',
    el: '#header',
    delimiters: ["<%", "%>"],
    data() {
        return {
            minimize: false,
            mobHeader: false,
            notif: false,
            query: "",
            timer: null,
            results: [],
            events: [],
            badge: badge,
            quests: false,
            login: {
                form: false,
                login: "",
                password: "",
                error: "",
                user: null,
            },
            dropdown: {
                form: false
            },
            T: T
        }
    },
    created() {
        var vm = this;
        $(document).ready(function() {
            if ($(window).scrollTop() > 30) {
                vm.minimize = true;
            } else {
                vm.minimize = false;
            }
            $('div#content').off("click");
            var scrollEvent = function() {
                $(window).scroll(function() {
                    if ($(window).scrollTop() > 30) {
                        vm.minimize = true;
                    } else {
                        vm.minimize = false;
                    }
                });
            };
            $(window).on("pjax:success", scrollEvent);
            scrollEvent();
            $('div#content').click(function(e) {
                vm.login.form = false;
                vm.dropdown.form = false;
                vm.mobHeader = false;
                vm.notif = false;

                $("#app").removeClass("unfocus");
            });
            if (document.documentElement.clientWidth < 992) {
                $('.notif-block').width(window.screen.width);
                $('.notif-block').css("margin-left", -window.screen.width / 2 + 49);

            }
            $("#query").focusout(function(event) {
                if (event.relatedTarget && event.relatedTarget.localName == "button") {
                    event.preventDefault();
                    $(this).focus();
                    return;
                }
                var timeout = 0;
                if (window.event) {
                    if (window.event.relatedTarget != null) {
                        timeout = 180;
                    }
                }
                setTimeout(() => {
                    $(this).val("");
                    vm.query = "";
                }, timeout);
            });
            vm.initWS();
        });
    },
    watch: {
        notif(en) {
            if (en) {
                try {
                    socket.emit("mark_read");
                } catch {
                    var vm = this;
                    socket.onopen(function() {
                        vm.markRead();
                    })

                }

                this.badge = 0;

                $("#app").addClass("unfocus");
            } else {
                $("#app").removeClass("unfocus");
            }
        },
        query(name) {
            if (name == "") return;
            clearTimeout(this.timer);
            this.timer = setTimeout(this.lookupUsers, 150, name);
        },
        mobHeader(enable) {
            if (enable == true) {
                this.notif = false;
                this.login.form = false;
                $("#app").addClass("unfocus");

            } else {
                this.query = "";
                this.results = [];
                if (!this.login.form)
                    $("#app").removeClass("unfocus");
            }
        }
    },
    methods: {
        initWS() {
            if (token == null) {
                return;
            }
            var vm = this;
            socket.onnotif = (data) => {
                vm.handleNotif(data);
            };
        },
        handleNotif(event) {
            $(".notif-empty-header").remove();
            this.badge += 1;
            this.events.unshift(event);
        },
        markRead() {
            if (token == null) {
                this.setTimeout(this.markRead, 5000);
            }
            socket.emit("mark_read");
            this.events.forEach((val) => {
                val['unread'] = 0;
            });
            $(".notif-single.unread").removeClass('unread');

        },
        lookupUsers(name) {
            var vm = this;
            this.$axios.get("/users/lookup", {
                params: { username: name }
            }).then(function(response) {

                if (response.data.result.length == 0) {
                    vm.results = null;
                } else {
                    vm.results = response.data.result;
                }
            });

        },
        showLogin() {
            this.login.form = !this.login.form;
            this.mobHeader = false;
            if (this.login.form) {
                $("#app").addClass("unfocus");
            }

            this.dropdown.form = false;
        },
        showDropdown(e) {
            e.preventDefault();
            this.dropdown.form = !this.dropdown.form;

        },
        getDate(date) {
            if (date) {
                var d = new Date(date * 1000);
            } else {
                var d = new Date();
            }
            var options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            };
            var date_str = d.toLocaleString("ru-RU", options).split(",");
            var date = "<b>" + date_str[0].split('/').join(' ') + "</b>";
            var time = '<span class="notif-time">' + date_str[1] + '</span>';
            return date + time;

        },
        redirect() {
            if (this.results == null) {
                window.location = '/u/' + this.query;
            } else {
                window.location = '/u/' + this.results[0]['id'];
            }

        },
        auth() {
            if (this.login.login == '' || this.login.password == '') return;
            var vm = this;
            $(".dropdown-login-content").addClass("load");
            this.$axios.post("/auth", { user: this.login.login, password: this.login.password }).then(function(response) {
                if (response.data != "ok") {
                    $(".dropdown-login-content").removeClass("load");
                    vm.login.user = null;
                    setTimeout(() => vm.login.user = {}, 1500);
                    if (response.data == "ban") {
                        vm.login.error = "You're banned.";
                    } else vm.login.error = "wrong username/password";

                } else {
                    location.reload();
                }
            });
        },
        logout() {
            var r = confirm("Are you sure?");
            if (r == true) {
                this.$axios.post("/logout").then(function(response) {
                    location.replace("/home");
                    location.reload();
                });
            }

        },
        expand(e) {
            var target = e.target;
            if (target.className != "mobile-header--single") {
                target = target.parentNode;
            }
            target = $(target);
            var isExpanded = target.hasClass("expanded");
            if (isExpanded) {
                target.removeClass("expanded");
            } else {
                target.addClass("expanded");
            }
        },
        addRemoveFriend(userID) {
            if (!window.event) return;
            window.event.preventDefault();
            var targetbtn = window.event.target;
            this.$axios.post("/addremovefriend", { userID: userID }).then(function(response) {
                var results = ["", "friend", "mutual"];
                $(targetbtn).attr("class", "follow " + results[response.data.result]);
            });
        },
        getFriendStatus(status) {
            switch (status) {
                case 1:
                    return "mutual";
                case 0:
                    return "friend";
                default:
                    return "";
            }
        },
        refreshQuests() {
            var r = confirm("Are you sure?");
            if (r == true) {
                this.$axios.post("/quests/refresh").then(function() {
                    location.reload();
                });
            }
        },
        scoreFormat(score) {
            var addCommas = this.addCommas;
            if (score > 1000 * 1000) {
                if (score > 1000 * 1000 * 1000)
                    return addCommas((score / 1000000000).toFixed(2)) + "bill.";
                return addCommas((score / 1000000).toFixed(2)) + "mill.";
            }
            return addCommas(score);
        },
        addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
    }
});