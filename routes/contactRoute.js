const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.get("/contacts/search", contactController.searchContact);
router.post("/contacts", contactController.sendContactRequest);
router.put("/contacts/accept/:contactId", contactController.acceptContactRequest);
router.delete("/contacts/reject/:contactId", contactController.rejectContactRequest);
router.get("/contacts/received/:userId", contactController.listReceivedRequests);
router.put("/contacts/block/:contactId", contactController.blockContact);
router.get("/contacts/established/:userId", contactController.listContacts);
router.delete("/contacts/:contactId", contactController.deleteContact);

module.exports = router;
