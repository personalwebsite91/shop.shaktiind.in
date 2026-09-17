
/* =========================================================
   PHYLOS — EARLY ACCESS
   Main JavaScript + Supabase
========================================================= */


/* =========================================================
   1. SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL = "https://fjhyckdxcddpkcujppid.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaHlja2R4Y2RkcGtjdWpwcGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MDIyNzksImV4cCI6MjEwNTE3ODI3OX0.GUXM78Im6fvf0Y64g44udkHanu5zAEtwZmaoRAdvWGw";

/* =========================================================
   PHYLOS — EARLY ACCESS
   Main JavaScript + Supabase
========================================================= */


/* =========================================================
   1. SUPABASE CONFIGURATION
========================================================= */



const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   2. DOM ELEMENTS
========================================================= */

const form =
    document.getElementById("earlyAccessForm");

const successMessage =
    document.getElementById("successMessage");

const submitButton =
    form
        ? form.querySelector(".submit-button")
        : null;

const bandQuantity =
    document.getElementById("bandQuantity");

const buyingForCheckboxes =
    document.querySelectorAll(
        'input[name="buyingFor"]'
    );


/* =========================================================
   3. AUTOMATIC BAND COUNTER
========================================================= */

function updateBandQuantity() {

    const selected =
        document.querySelectorAll(
            'input[name="buyingFor"]:checked'
        );

    const quantity =
        selected.length;


    if (bandQuantity) {

        bandQuantity.textContent =
            quantity;

    }

}


/* Listen for every checkbox change */

buyingForCheckboxes.forEach(
    (checkbox) => {

        checkbox.addEventListener(
            "change",
            updateBandQuantity
        );

    }
);


/* Initial value */

updateBandQuantity();


/* =========================================================
   4. FORM SUBMISSION
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* ---------------------------------------------
               Collect form data
            --------------------------------------------- */

            const formData =
                new FormData(form);


            /* ---------------------------------------------
               Get ALL selected recipients
            --------------------------------------------- */

            const selectedPeople =
                formData.getAll("buyingFor");


            /* ---------------------------------------------
               Automatically calculate quantity
            --------------------------------------------- */

            const quantity =
                selectedPeople.length;


            /* ---------------------------------------------
               Create lead object
            --------------------------------------------- */

            const lead = {

                name:
                    formData
                        .get("name")
                        ?.trim(),

                email:
                    formData
                        .get("email")
                        ?.trim()
                        .toLowerCase(),

                age:
                    Number(
                        formData.get("age")
                    ),

                buyingFor:
                    selectedPeople,

                quantity:
                    quantity,

                budget:
                    formData.get("budget")

            };


            /* =================================================
               VALIDATION
            ================================================= */

            if (
                !lead.name ||
                !lead.email ||
                !lead.age ||
                lead.quantity === 0
            ) {

                showError(
                    "Please fill in all required fields."
                );

                return;

            }


            /* ---------------------------------------------
               Name validation
            --------------------------------------------- */

            if (
                lead.name.length < 2
            ) {

                showError(
                    "Please enter your full name."
                );

                return;

            }


            /* ---------------------------------------------
               Age validation
            --------------------------------------------- */

            if (
                !Number.isInteger(
                    lead.age
                ) ||
                lead.age < 1 ||
                lead.age > 120
            ) {

                showError(
                    "Please enter a valid age."
                );

                return;

            }


            /* ---------------------------------------------
               Email validation
            --------------------------------------------- */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    lead.email
                )
            ) {

                showError(
                    "Please enter a valid email address."
                );

                return;

            }


            /* =================================================
               LOADING
            ================================================= */

            setLoading(true);


            try {

                /* =================================================
                   SAVE TO SUPABASE
                ================================================= */

                const { error } =
                    await supabaseClient
                        .from("early_access")
                        .insert([
                            {
                                name:
                                    lead.name,

                                email:
                                    lead.email,

                                age:
                                    lead.age,

                                buying_for:
                                    lead.buyingFor,

                                quantity_interest:
                                    lead.quantity,

                                budget_range:
                                    lead.budget ||
                                    null
                            }
                        ]);


                /* ---------------------------------------------
                   Supabase error
                --------------------------------------------- */

                if (error) {

                    throw error;

                }


                /* ---------------------------------------------
                   Success
                --------------------------------------------- */

               console.log(
    "Phylos early access submission successful.",
    lead
);


/* Update live statistics immediately */

await loadEarlyAccessStats();


showSuccess();


  


            } catch (error) {

                console.error(
                    "Phylos early access submission failed:",
                    error
                );


                /* ---------------------------------------------
                   Duplicate email
                --------------------------------------------- */

                if (
                    error.code === "23505"
                ) {

                    showError(
                        "This email is already on the Phylos early access list."
                    );

                } else {

                    showError(
                        "Something went wrong. Please try again."
                    );

                }

            } finally {

                setLoading(false);

            }

        }
    );

}


/* =========================================================
   5. LOADING STATE
========================================================= */

function setLoading(isLoading) {

    if (!submitButton) {
        return;
    }


    submitButton.disabled =
        isLoading;


    if (isLoading) {

        submitButton.dataset.originalText =
            submitButton.textContent;

        submitButton.textContent =
            "Joining...";

        submitButton.style.opacity =
            "0.7";

    } else {

        submitButton.textContent =
            submitButton.dataset.originalText ||
            "Join the Waitlist";

        submitButton.style.opacity =
            "1";

    }

}


/* =========================================================
   6. SUCCESS STATE
========================================================= */

function showSuccess() {

    if (
        !form ||
        !successMessage
    ) {

        return;

    }


    form.hidden = true;

    successMessage.hidden = false;


    successMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   7. ERROR MESSAGE
========================================================= */

function showError(message) {

    alert(message);

}


/* =========================================================
   8. NAVBAR SCROLL EFFECT
========================================================= */

const navbar =
    document.querySelector(".navbar");


if (navbar) {

    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY > 20
            ) {

                navbar.style.boxShadow =
                    "0 8px 30px rgba(11, 31, 77, 0.06)";

            } else {

                navbar.style.boxShadow =
                    "none";

            }

        }
    );

}


/* =========================================================
   9. SMOOTH SCROLL
========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );


/* =========================================================
   10. CURRENT YEAR
========================================================= */

const year =
    new Date().getFullYear();


document
    .querySelectorAll(
        ".footer-company"
    )
    .forEach(
        (footer) => {

            footer.innerHTML =
                footer.innerHTML.replace(
                    /©\s*\d{4}/,
                    `© ${year}`
                );

        }
    );


/* =========================================================
   11. PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Phylos Early Access website ready."
        );

    }
);

/* =========================================================
   EARLY ACCESS LIVE STATS
========================================================= */

const interestedPeople =
    document.getElementById("interestedPeople");

const interestedBands =
    document.getElementById("interestedBands");


async function loadEarlyAccessStats() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "get_early_access_stats"
            );


        if (error) {

            console.error(
                "Unable to load early access stats:",
                error
            );

            return;
        }


        if (
            data &&
            data.length > 0
        ) {

            const stats = data[0];


            if (interestedPeople) {

                interestedPeople.textContent =
                    Number(
                        stats.interested_people
                    ).toLocaleString("en-IN");

            }


            if (interestedBands) {

                interestedBands.textContent =
                    Number(
                        stats.interested_bands
                    ).toLocaleString("en-IN");

            }

        }

    } catch (error) {

        console.error(
            "Early access stats error:",
            error
        );

    }

}


/* Load when website opens */

loadEarlyAccessStats();


/* Refresh every 30 seconds */

setInterval(
    loadEarlyAccessStats,
    30000
);
/* =========================================================
   PHYLOS HERO VIDEO
   Video 1 → Video 2 → repeat
   Mute when hero is scrolled out of view
========================================================= */
/* =========================================================
   PHYLOS HERO VIDEO — CONTINUOUS PLAY

   Video 1 → Video 2 → Video 1 → Video 2 → ...

   Desktop + Mobile:
   - Always muted
   - Always playing
   - Scrolling does NOT stop video
   - Scrolling back does NOT restart video
   - No static image
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const videoA = document.getElementById("heroVideoA");
    const videoB = document.getElementById("heroVideoB");

    if (!videoA || !videoB) {
        console.warn(
            "Phylos hero: videos not found."
        );
        return;
    }

    const videos = [videoA, videoB];

    let currentVideo = 0;


    /* =====================================================
       PREPARE BOTH VIDEOS
    ===================================================== */

    videos.forEach((video) => {

        video.muted = true;
        video.defaultMuted = true;

        video.setAttribute("muted", "");
        video.setAttribute("autoplay", "");
        video.setAttribute("playsinline", "");
        video.setAttribute(
            "webkit-playsinline",
            ""
        );

        video.playsInline = true;

        video.loop = false;
        video.preload = "auto";

    });


    /* =====================================================
       PLAY VIDEO
    ===================================================== */

    async function playVideo(index) {

        currentVideo = index;

        const activeVideo =
            videos[currentVideo];


        /* Stop the other video */

        videos.forEach(
            (video, i) => {

                if (i !== currentVideo) {

                    video.pause();

                    video.classList.remove(
                        "active"
                    );

                    video.muted = true;

                }

            }
        );


        /* Activate current video */

        activeVideo.classList.add(
            "active"
        );


        /* Always muted */

        activeVideo.muted = true;
        activeVideo.defaultMuted = true;


        try {

            await activeVideo.play();

            console.log(
                `Phylos: Video ${
                    currentVideo + 1
                } playing`
            );

        }

        catch (error) {

            console.warn(
                `Phylos: Video ${
                    currentVideo + 1
                } could not autoplay.`,
                error
            );


            /*
             * Retry after loading the video.
             */

            try {

                activeVideo.load();

                activeVideo.muted = true;

                await activeVideo.play();

                console.log(
                    `Phylos: Video ${
                        currentVideo + 1
                    } playing after retry`
                );

            }

            catch (retryError) {

                console.error(
                    `Phylos: Video ${
                        currentVideo + 1
                    } failed.`,
                    retryError
                );

            }

        }

    }


    /* =====================================================
       VIDEO 1 → VIDEO 2
    ===================================================== */

    videoA.addEventListener(
        "ended",
        () => {

            console.log(
                "Phylos: Video 1 ended → Video 2"
            );

            playVideo(1);

        }
    );


    /* =====================================================
       VIDEO 2 → VIDEO 1
    ===================================================== */

    videoB.addEventListener(
        "ended",
        () => {

            console.log(
                "Phylos: Video 2 ended → Video 1"
            );

            playVideo(0);

        }
    );


    /* =====================================================
       VIDEO LOAD LOGGING
    ===================================================== */

    videoA.addEventListener(
        "loadeddata",
        () => {

            console.log(
                "Phylos: Video 1 loaded."
            );

        }
    );


    videoB.addEventListener(
        "loadeddata",
        () => {

            console.log(
                "Phylos: Video 2 loaded."
            );

        }
    );


    /* =====================================================
       ERROR LOGGING
    ===================================================== */

    videoA.addEventListener(
        "error",
        () => {

            console.error(
                "Phylos: Video 1 error:",
                videoA.error
            );

        }
    );


    videoB.addEventListener(
        "error",
        () => {

            console.error(
                "Phylos: Video 2 error:",
                videoB.error
            );

        }
    );


    /* =====================================================
       START VIDEO 1
    ===================================================== */

    playVideo(0);

});