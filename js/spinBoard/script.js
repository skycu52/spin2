$(document).ready(function () {
    var spinsize = 0;
    var spinfont = 0;
    //getTop5Prizes();
    //getRandomPrizes();

    let segments = modelData.map((item, index) => {
        let fillStyle = '';
        let textStyle = '';
        if (index % 2 == 0) {
            fillStyle = '#ffdd02';
            textStyle = '#333333';
        } else {
            fillStyle = '#000000';
            textStyle = '#ffdd02';
        }

        return {
            fillStyle: fillStyle,
            textFillStyle: textStyle,
            text: item.rewarD_TITLE
        };
    })

    if ($(window).width() < 576) {
        spinfont = 14;
    } else {
        spinfont = 16;
    };

    // Create new wheel object specifying the parameters at creation time.
    let theWheel = new Winwheel({
        'numSegments': segments.length,     // Specify number of segments.
        'outerRadius': 184,   // Set outer radius so wheel fits inside the background.
        'textFontSize': spinfont,    // Set font size as desired.
        'textMargin': 20,
        'textAlignment': 'center',
        'segments':        // Define segments including colour and text.
            segments,
        'animation':           // Specify the animation to use.
        {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8,
            'callbackFinished': alertPrize,
            'callbackSound': playSound,   // Function to call when the tick sound is to be triggered.
            'soundTrigger': 'pin'        // Specify pins are to trigger the sound, the other option is 'segment'.
        },
        'pins':
        {
            'number': 16   // Number of pins. They space evenly around the wheel.
        },
        'centerX': 189,
        'centerY': 191
    });

    // -----------------------------------------------------------------
    // This function is called when the segment under the prize pointer changes
    // we can play a small tick sound here like you would expect on real prizewheels.
    // -----------------------------------------------------------------
    let audio = new Audio('../../images/spinBoard/spin.mp3');  // Create audio object and load tick.mp3 file.

    function playSound() {
        // Stop and rewind the sound if it already happens to be playing.
        audio.pause();
        audio.currentTime = 0;

        // Play the sound.
        audio.play();
    }

    // -------------------------------------------------------
    // Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters
    // note the indicated segment is passed in as a parmeter as 99% of the time you will want to know this to inform the user of their prize.
    // -------------------------------------------------------
    function alertPrize(indicatedSegment) {
        // Do basic alert of the segment text.
        // You would probably want to do something more interesting with this information.
        alert("You have won " + indicatedSegment.text);
        resetWheel();
    }

    // =======================================================================================================================
    // Code below for the power controls etc which is entirely optional. You can spin the wheel simply by
    // calling theWheel.startAnimation();
    // =======================================================================================================================
    let wheelPower = 0;
    let wheelSpinning = false;

    // -------------------------------------------------------
    // Function to handle the onClick on the power buttons.
    // -------------------------------------------------------
    function powerSelected(powerLevel) {
        // Ensure that power can't be changed while wheel is spinning.
        if (wheelSpinning == false) {
            // Reset all to grey incase this is not the first time the user has selected the power.
            document.getElementById('pw1').className = "";
            document.getElementById('pw2').className = "";
            document.getElementById('pw3').className = "";

            // Now light up all cells below-and-including the one selected by changing the class.
            if (powerLevel >= 1) {
                document.getElementById('pw1').className = "pw1";
            }

            if (powerLevel >= 2) {
                document.getElementById('pw2').className = "pw2";
            }

            if (powerLevel >= 3) {
                document.getElementById('pw3').className = "pw3";
            }

            // Set wheelPower var used when spin button is clicked.
            wheelPower = powerLevel;

            // Light up the spin button by changing it's source image and adding a clickable class to it.
            document.getElementById('spin_button').src = "../img/spin_on.png";
            document.getElementById('spin_button').className = "clickable";
        }
    }

    // -------------------------------------------------------
    // Click handler for spin button.
    // -------------------------------------------------------
    function startSpin() {
        let code = $('#inputcode').val();
        if (code) {
            $.ajax({
                url: "https://silent-darkness-f52a.skycu52.workers.dev/api/v1/checkCode",
                method: "POST",
                contentType: "application/json", // Ensure the correct content type
                data: JSON.stringify({ UNIQUE_CODE: code }), // Convert data to JSON string
                success: function (data) {
                    //const keyBase64 = 'K+9T3D4eO6hB3j8l7Fk6p/1Xw7osF8hxjVJr6Xx4S8A=';
                    //const ivBase64 = 'q3+1GHSO09lA1j8F9CQ7Lg=='; 
                    //var jsonData = JSON.parse(decrypt(data, keyBase64, ivBase64));
                    //let probabilities = jsonData.flatMap(x => x.REWARD_PROBABILITY);
                    //if (probabilities.every(value => value === 0)) { // check if all probability is 0
                    //    probabilities = probabilities.map(value => 1); // set al probability to 1
                    //}

                    //let totalWeight = probabilities.reduce((sum, weight) => sum + weight, 0) == 0 ? jsonData.length : probabilities.reduce((sum, weight) => sum + weight, 0);
                    //let cumulativeWeights = probabilities.reduce((cumulative, weight) => {
                    //    const lastValue = cumulative.length > 0 ? cumulative[cumulative.length - 1] : 0;
                    //    if (totalWeight == 0) {
                    //        cumulative.push(lastValue + 1); // default if total weight = 0
                    //    } else {
                    //        cumulative.push(lastValue + weight);
                    //    }
                    //    return cumulative;
                    //}, []);

                    $('#modalone').modal('hide');
                    $('.error-message').text('');

                    // Ensure that spinning can't be clicked again while already running.
                    if (wheelSpinning == false && data >= 0) {
                        $('#spinbutton').addClass('disabled');

                        // Based on the power level selected adjust the number of spins for the wheel, the more times is has
                        // to rotate with the duration of the animation the quicker the wheel spins.
                        //if (wheelPower == 1) {
                        //    theWheel.animation.spins = 3;
                        //} else if (wheelPower == 2) {
                        //    theWheel.animation.spins = 8;
                        //} else if (wheelPower == 3) {
                        //    theWheel.animation.spins = 15;
                        //}

                        // Disable the spin button so can't click again while wheel is spinning.
                        //document.getElementById('spin_button').src = "../img/spin_off.png";
                        //document.getElementById('spin_button').className = "";



                        //const selectedSegment = getRandomSegment(probabilities, totalWeight, cumulativeWeights);
                        var stopAt = theWheel.getRandomForSegment(data + 1);
                        theWheel.animation.stopAngle = stopAt;
                        // Begin the spin animation by calling startAnimation on the wheel object.
                        theWheel.startAnimation();

                        // Set to true so that power can't be changed and spin button re-enabled during
                        // the current animation. The user will have to reset before spinning again.
                        wheelSpinning = true;

                        $('#usercode').text(`Code - ${code}`)
                        $('#reward-title').html(`<b>${modelData[data].rewarD_TITLE}</b> !!!`)
                        saveReward(code, modelData[data].rewarD_ID);
                    }
                },
                error: function (error) {
                    console.error('Error:', error);
                    $(".error-message").text(error.responseText);
                }
            });
        } else {
            $(".error-message").text("Please enter code.");
        }
    }

    // -------------------------------------------------------
    // Function for reset button.
    // -------------------------------------------------------
    function resetWheel() {
        theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
        theWheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
        theWheel.draw();                // Call draw to render changes to the wheel.

        $('#inputcode').val('');
        $('.error-message').text('')

        //document.getElementById('pw1').className = "";  // Remove all colours from the power level indicators.
        //document.getElementById('pw2').className = "";
        //document.getElementById('pw3').className = "";
        $('#spinbutton').removeClass('disabled')
        wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
    }

    //function getRandomSegment(probabilities, totalWeight, cumulativeWeights) {
    //    const random = Math.random() * totalWeight;
    //    return cumulativeWeights.findIndex(cumulativeWeight => random < cumulativeWeight);
    //}

    $('.close').on('click', function () {
        $('#inputcode').val('');
        $('.error-message').text('')
    });

    $('#inputcode').on('input', function () {
        $('.error-message').text('');
    });

    // Handling hover effects
    $('#spinbutton').on('mouseenter', function () {
        $(this).removeClass('animate__pulse').addClass('animate__tada');
    }).on('mouseleave', function () {
        $(this).removeClass('animate__tada').addClass('animate__pulse');
    });

    $('#rewardbutton').on('mouseenter', function () {
        $(this).removeClass('animate__pulse').addClass('animate__tada');
    }).on('mouseleave', function () {
        $(this).removeClass('animate__tada').addClass('animate__pulse');
    });

    // Initialize Bootstrap tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    function checkCode() {
        if (wheelSpinning == false) {
            $('#modalone').modal({
                backdrop: 'static',
                keyboard: false
            })
        }
    }

    function alertPrize() {
        resetWheel();
        $('#bgBlur').removeClass('hide');
        $('#prize').removeClass('hide');
    }

    function claimReward() {
        var rewardPage = "https://wa.me/601120630173/"; // Replace with your desired URL
        window.open(rewardPage, '_blank');
    }

    function closePrize() {
        $('#bgBlur').addClass('hide');
        $('#prize').addClass('hide');
    }

    function saveReward(code, reward) {
        $.ajax({
            url: "https://silent-darkness-f52a.skycu52.workers.dev/api/v1/saveReward",
            method: "POST",
            contentType: "application/json", // Ensure the correct content type
            data: JSON.stringify({ UNIQUE_CODE: code, REWARD_ID: reward }), // Convert data to JSON string
            success: function (data) {
                // success
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    }

    function getTop5Prizes() {
        $.ajax({
            url: "/api/v1/getPrizes",
            method: "GET",
            contentType: "application/json", // Ensure the correct content type
            success: function (data) {
                // success
                var prizes = JSON.parse(data); // Assuming the data is passed this way

                if (prizes) {
                    $('.livetrans tbody').empty();

                    prizes.forEach(function (prize) {
                        $('.livetrans tbody').append(
                            `<tr>
                            <th class="code">${prize.UNIQUE_CODE}</th>
                            <td class="reward">${prize.REWARD_TITLE}</td>
                        </tr>`
                        );
                    });
                }
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    }

    function generateCode() {
        const key = "spinningboardUN1QU3C0D3";
        const now = new Date();
        const dateTimeStr = now.getFullYear().toString().slice(-2) +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0') +
            now.getMilliseconds().toString().padStart(3, '0');

        const code = key + dateTimeStr;
        return code;
    }

    function hashAndTruncateCode(code, length) {
        const hashed = CryptoJS.SHA256(code).toString(CryptoJS.enc.Base64);
        const truncated = hashed.replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
        return truncated;
    }

    //function getRandomPrizes() {
    //    $('.livetrans tbody').empty();
    //    var codes = [];
    //    let count = 0;
    //    const interval = setInterval(() => {
    //        if (count < 5) {
    //            const code = generateCode();
    //            const encryptedCode = hashAndTruncateCode(code, 15);
    //            codes.push(encryptedCode);
    //            count++;
    //        } else {
    //            clearInterval(interval); // Stop the interval after 5 executions

    //            for (var i = 0; i < 5; i++) {

    //                $('.livetrans tbody').append(
    //                    `<tr>
    //                        <th class="code">${codes[i]}</th>
    //                        <td class="reward">RM 100 Credit</td>
    //                    </tr>`
    //                );
    //            }
    //        }
    //    }, 10);
    //}

    //function decrypt(cipherTextBase64, keyBase64, ivBase64) {
    //    // Decode base64 to bytes
    //    const keyBytes = CryptoJS.enc.Base64.parse(keyBase64);
    //    const ivBytes = CryptoJS.enc.Base64.parse(ivBase64);
    //    const cipherBytes = CryptoJS.enc.Base64.parse(cipherTextBase64);

    //    // Decrypt
    //    const decrypted = CryptoJS.AES.decrypt(
    //        { ciphertext: cipherBytes },
    //        keyBytes,
    //        {
    //            iv: ivBytes,
    //            mode: CryptoJS.mode.CBC,
    //            padding: CryptoJS.pad.Pkcs7
    //        }
    //    );

    //    // Convert decrypted bytes to string
    //    return decrypted.toString(CryptoJS.enc.Utf8);
    //}

    $('#spinbutton').on('click', () => {
        checkCode();
    })

    $('#resetbutton').on('click', () => {
        resetWheel();
    })

    $('#playbutton').on('click', () => {
        startSpin();
    })

    $('#rewardbutton').on('click', () => {
        claimReward();
    })

    $('#closeprize').on('click', () => {
        location.reload();
    })
})




