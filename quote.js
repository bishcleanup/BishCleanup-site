(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/info@bishcleanup.com";
  var form = document.getElementById("quote-form");
  if (!form) return;

  var btn = document.getElementById("submit-btn");
  var errBox = document.getElementById("form-error");
  var formWrap = document.getElementById("form-wrap");
  var successBox = document.getElementById("success");
  var refOut = document.getElementById("ref-out");
  var againBtn = document.getElementById("again-btn");

  function makeRef() {
    return "BC-" + String(Math.floor(100000 + Math.random() * 900000));
  }

  function val(name) {
    var el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function setBusy(busy) {
    btn.disabled = busy;
    btn.textContent = busy ? "Sending..." : "Send request";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errBox.hidden = true;

    // Honeypot: real visitors never fill this in. Do nothing for bots.
    if (val("_honey")) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var ref = makeRef();
    var services = Array.prototype.map.call(
      form.querySelectorAll('input[name="services"]:checked'),
      function (c) { return c.value; }
    );

    var payload = {
      _subject: "Quote request " + ref + " - " + val("name"),
      _template: "table",
      _captcha: "false",
      _honey: "",
      "Reference number": ref,
      "Full name": val("name"),
      "Phone": val("phone"),
      "Email": val("email") || "(not given)",
      "You are": val("role"),
      "Best way to reach": val("contact_method"),
      "Street address": val("address"),
      "City": val("city"),
      "County": val("county"),
      "Property type": val("property_type"),
      "Services requested": services.length ? services.join(", ") : "(none selected)",
      "How often": val("frequency"),
      "When needed": val("timing"),
      "Notes": val("notes") || "(none)"
    };
    if (val("email")) payload._replyto = val("email");

    setBusy(true);

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          var ok = res.ok && (data.success === true || data.success === "true");
          if (!ok) throw new Error((data && data.message) || "Request failed");
          return data;
        });
      })
      .then(function () {
        refOut.textContent = ref;
        formWrap.hidden = true;
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        errBox.hidden = false;
        errBox.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .then(function () { setBusy(false); });
  });

  againBtn.addEventListener("click", function () {
    form.reset();
    errBox.hidden = true;
    successBox.hidden = true;
    formWrap.hidden = false;
    form.elements["name"].focus();
  });
})();
