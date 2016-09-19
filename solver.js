(function(w, $, _) {
    var app = {
        defaultPayoutList: {
            '6': '10000',
            '7': '36',
            '8': '720',
            '9': '360',
            '10': '80',
            '11': '252',
            '12': '108',
            '13': '72',
            '14': '54',
            '15': '180',
            '16': '72',
            '17': '180',
            '18': '119',
            '19': '36',
            '20': '306',
            '21': '1080',
            '22': '144',
            '23': '1800',
            '24': '3600'
        },
        validValues: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        guessesAllowed: 4,
        cardContainer: $('.playing-card-field'),
        resetButton: $('#reset-card'),
        payoutContainer: $('.payout-panel'),
        playFields: false,
        init: function() {
            var _this = this;
            _this.resetButton.on('click', _this.resetGame);
            _this.buildPayoutsList(function() {
                _this.buildPlayingCardField(function() {
                    _this.playFields.each(function() {
                        $(this).height($(this).width());
                    });
                    _this.playFields.on('keyup', _.debounce(function(e) {
                        _this.cardFieldChange(e);
                    }, 100));
                });
            });
        },
        resetGame: function(cb) {
            var _this = this;
            $('.form-group').removeClass('has-error');
            $('.field').val('');
        },
        buildPayoutsList: function(cb) {
            var _this = this;
            $.each(this.defaultPayoutList, function(k, v) {
                var formGroup = $('<div></div>');
                formGroup.addClass('form-group');
                formGroup.css({
                    'display': 'inline-block',
                    'float': 'left',
                    'margin': '0.25em'
                });
                var inputGroup = $('<div></div>');
                inputGroup.attr('id', 'input-group-p' + k);
                inputGroup.addClass('input-group input-group-sm');
                inputGroup.append('<div class="input-group-addon">' + k + '</div>');
                inputGroup.append(
                    $('<input/>')
                    .attr({
                        'type': 'text',
                        'id': 'p' + k
                    })
                    .addClass('form-control input-sm')
                    .val(v)
                );
                inputGroup.append(
                    $('<div></div>')
                    .addClass('input-group-btn point-value')
                    .append(
                        $('<button></button>')
                        .addClass('btn btn-default')
                        .attr('type', 'button')
                        .html(0)
                    )
                );
                formGroup.append(inputGroup);
                _this.payoutContainer.append(formGroup);
            });
            if (typeof(cb) === 'function') cb();
        },
        buildPlayingCardField: function(cb) {
            var _this = this;
            for (var row = 0; row < 3; row++) {
                var rowHtml = $('<div></div>').addClass('row').css('margin', '0.25em 0');
                for (var col = 0; col < 3; col++) {
                    rowHtml.append(
                        $('<div></div>')
                        .addClass('col-xs-4')
                        .append(
                            $('<div></div>')
                            .addClass('form-group')
                            .append($('<input />')
                                .addClass('form-control field')
                                .css({
                                    'font-size': '2.5em',
                                    'font-weight': 'bold',
                                    'text-align': 'center'
                                })
                                .attr({
                                    'type': 'text',
                                    'id': 'field' + row + 'x' + col
                                }))
                        )
                    );
                }
                _this.cardContainer.append(rowHtml);
            }
            _this.playFields = $('input.field', this.cardContainer);
            if (typeof(cb) === 'function') cb();
        },
        cardFieldChange: function(e) {
            var _this = this;
            var _input = $(e.target);
            var _inputGroup = _input.closest('.form-group');
            var number = parseInt($.trim(_input.val()));

            _inputGroup.removeClass('has-error');

            if ($.inArray(number, _this.validValues) < 0) {
                _input.val('');
                return false;
            }

            if (number != _input.val()) _input.val(number);

            var dupFound = false;
            var numFilled = 0;
            _this.playFields.each(function() {
                if ($(this).attr('id') == _input.attr('id')) {
                    numFilled++;
                    return true;
                }
                var curVal = parseInt($.trim($(this).val()));
                if (!curVal) return true;
                if (curVal == number) {
                    dupFound = true;
                    _inputGroup.addClass('has-error');
                    return false;
                }
                numFilled++;
            });
            if (dupFound) return false;

            if (numFilled == _this.guessesAllowed) console.log('ok ready');
        }
    }
    app.init();
})(window, jQuery, _);