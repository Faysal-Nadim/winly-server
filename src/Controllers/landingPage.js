const LandingPage = require("../Models/landingPage");

// exports.submitLandingPage = (req, res) => {
//   console.log("hit");
//   const _lp = new LandingPage(req.body);
//   _lp.save((error, LandingPage) => {
//     if (error) {
//       return res.status(400).json({ msg: "Something Went Wrong", error });
//     }
//     if (LandingPage) {
//       return res.status(201).json({ msg: "LP created" });
//     }
//   });
// };

exports.updateLandingPage = (req, res) => {
  const { _id } = req.body;

  //   console.log(req.body);

  LandingPage.findOneAndUpdate(
    { _id: _id },
    {
      $set: req?.body,
    },
    { new: true }
  ).exec((error, _lp) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (_lp) {
      return res.status(200).json({ msg: "Landing Page Updated!", _lp });
    }
  });
};

exports.getAllLandingPage = (req, res) => {
  LandingPage.find().exec((error, LandingPages) => {
    if (error) {
      return res.status(400).json({ msg: "Something Went Wrong", error });
    }
    if (LandingPages) {
      return res.status(200).json({ LandingPages });
    }
  });
};
