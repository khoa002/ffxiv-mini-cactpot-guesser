(function (w, $, _) {
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
        defaultProbResults: {
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            '21': 0,
            '22': 0,
            '23': 0,
            '24': 0
        },
        validNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        numbersUsed: [],
        guessesAllowed: 4,
        ticketContainer: $('.ticket-field'),
        resetButton: $('#reset-card'),
        payoutContainer: $('.payout-panel'),
        init: function () {
            var _this = this;
            _this.resetButton.on('click', function () {
                $('.form-group').removeClass('has-error');
                $('input.field').val('');
                $('input.field', _this.ticketContainer).prop('disabled', false);
                _this.numbersUsed = [];
            });
            _this.buildPayoutsList(function () {
                _this.buildPlayingCardField(function () {
                    $('input.field', _this.ticketContainer).on('keyup', _.debounce(function (e) {
                        _this.cardFieldChange(e);
                    }, 100));
                });
            });
        },
        buildPayoutsList: function (cb) {
            var _this = this;
            $.each(this.defaultPayoutList, function (k, v) {
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
        buildPlayingCardField: function (cb) {
            var _this = this;
            for (var row = 1; row <= 5; row++) {
                var rowHtml = $('<div></div>').addClass('row').css('margin', '0.25em 0');
                switch (row) {
                    case 1:
                    case 5:
                        for (var col = 1; col <= 4; col++) {
                            var fieldHtml = '';
                            if (row == 1 && col == 4) fieldHtml = '<i class="fa fa-arrow-circle-up fa-rotate-45" aria-hidden="true"></i>';
                            else if (row == 5 && col == 4) fieldHtml = '<i class="fa fa-arrow-circle-right fa-rotate-45" aria-hidden="true"></i>';
                            else if (row == 5) fieldHtml = '<i class="fa fa-arrow-circle-down" aria-hidden="true"></i>';
                            rowHtml.append(
                                $('<div></div>')
                                    .addClass('col-xs-3')
                                    .attr({
                                        'id': 'field' + row + 'x' + col
                                    })
                                    .html(fieldHtml)
                            );
                        }
                        break;
                    default:
                        for (var col = 1; col <= 3; col++) {
                            rowHtml.append(
                                $('<div></div>')
                                    .addClass('col-xs-3 field' + row + 'x' + col)
                                    .append(
                                        $('<div></div>')
                                            .addClass('form-group')
                                            .append($('<input />')
                                                .addClass('form-control field field' + row + 'x' + col + ' row' + row + ' col' + col)
                                                .css({
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
                        var fieldHtml = (col == 4) ? '<i class="fa fa-arrow-circle-right" aria-hidden="true"></i>' : '';
                        rowHtml.append(
                            $('<div></div>')
                                .addClass('col-xs-3 field' + row + 'x' + col)
                                .html(fieldHtml)
                        );
                        break;
                }

                _this.ticketContainer.append(rowHtml);
            }

            var maxRowHeight = 0;
            $('.row', _this.ticketContainer).each(function (k, v) {
                if ($(this).height() > maxRowHeight) maxRowHeight = $(this).height();
            });
            $('.row', _this.ticketContainer).height(maxRowHeight);

            if (typeof(cb) === 'function') cb();
        },
        cardFieldChange: function (e) {
            var _this = this;
            var _input = $(e.target);
            var _inputGroup = _input.closest('.form-group');
            var number = parseInt($.trim(_input.val()));

            _inputGroup.removeClass('has-error');

            if ($.inArray(number, _this.validNumbers) < 0) {
                _input.val('');
                return false;
            }

            // set the value to only the parsed int, stripping any extra characters
            if (number != _input.val()) _input.val(number);

            _this.checkForDuplicates();

            var numFilled = _this.getFilledOutFields().length;

            if (numFilled == _this.guessesAllowed &&
                $('.form-group.has-error', _this.ticketContainer).length == 0) {
                _this.beginCalc();
            }
        },
        checkForDuplicates: function (e) {
            var _this = this;
            $('.form-group', _this.ticketContainer).removeClass('has-error');
            $('input.field', _this.ticketContainer).each(function () {
                var _input = $(this);
                var _curVal = parseInt($.trim(_input.val()));
                if (!_curVal) return true;
                $('input.field', _this.ticketContainer).each(function () {
                    var __input = $(this);
                    var __curVal = parseInt($.trim(__input.val()));
                    if (_input.attr('id') == __input.attr('id')) return true;
                    if (!__curVal) return true;
                    if (_curVal == __curVal) {
                        _input.closest('.form-group').addClass('has-error');
                        __input.closest('.form-group').addClass('has-error');
                    }
                });
            });
        },
        beginCalc: function () {
            var _this = this;
            $('input.field', _this.ticketContainer).prop('disabled', true);
            _this.getFilledOutFields().each(function (i, v) {
                var number = parseInt($.trim($(v).val()));
                if (!isNaN(number)) _this.numbersUsed.push(number);
            });
            for (var row = 2; row <= 4; row++) {
                var numbers = [];
                for (var col = 1; col <= 3; col++) {
                    var number = parseInt($.trim($('input#field' + row + 'x' + col).val()));
                    if (!isNaN(number)) numbers.push(number);
                }
                var results = _this.getGroupProbabilty(numbers);
            }
        },
        getGroupProbabilty: function (numbers) {
            var _this = this;
            switch (numbers.length) {
                case 3:
                    var sum = 0;
                    $.each(numbers, function (i, v) {
                        sum += v;
                    });
                    var results = _this.defaultProbResults;
                    results[sum] = 1;
                    return results;
                case 2:
                    var sum = 0;
                    $.each(numbers, function (i, v) {
                        sum += v;
                    });
                    var results = _this.defaultProbResults;
                    $.each(results, function (i, v) {
                        if (sum >= i) {
                            results[i] = 'zero';
                            return true;
                        }
                        var diff = i - sum;
                        if (_this.numbersUsed.indexOf(diff) > -1) {
                            results[i] = 'zilch';
                            return true;
                        }
                        results[i] = (1 - (1 / _this.numbersUsed.length));
                    });
                    console.log(results);
                    break;
                case 1:
                    break;
                case 0:
                    break;
                default:
                    return false;
            }
            if (numbers.length == 3) {

            }
        },
        getFilledOutFields: function () {
            var _this = this;
            return $('input.field', _this.ticketContainer).filter(function (k, v) {
                return !(!parseInt($.trim($(v).val())));
            });
        },
    }
    app.init();
})(window, jQuery, _);