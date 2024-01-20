import Yup from "yup";

const formSchema = Yup.object({
  username: Yup.string()
    .required("Username required")
    .min(2, "Username too short")
    .max(28, "Username too long!"),
  password: Yup.string()
    .required("Password required")
    .min(6, "Password too short")
    .max(28, "Password too long!"),
});

const validateForm = (req, res, next) => {
  const formData = req.body;
  formSchema
    .validate(formData)
    .then(() => {
      console.log("Validation Successful");
      next();
    })
    .catch((err) => {
      console.log(err.errors);
      res.status(422).json({ errors: err.errors });
    });
};

export default validateForm;