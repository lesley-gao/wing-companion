import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  TextField,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser } from "../store/slices/authSlice";
import {
  selectAuthError,
  selectAuthLoading,
} from "../store/slices/authSelectors";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof schema>;

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthLoading);
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const savedEmail = localStorage.getItem("savedEmail") || "";
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { email: savedEmail },
  });

  // Watch email field and update localStorage on change
  React.useEffect(() => {
    const subscription = watch((value) => {
      if (value.email !== undefined) {
        localStorage.setItem("savedEmail", value.email);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: LoginFormInputs) => {
    setApiError(null);
    setSnackbarOpen(false);
    localStorage.setItem("savedEmail", data.email);
    const result = await dispatch(loginUser(data));

    // Always extract the message string
    let errorMsg = "Login failed.";
    if (result?.payload) {
      if (typeof result.payload === "string") {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(result.payload);
          if (parsed && typeof parsed.message === "string") {
            errorMsg = parsed.message;
          } else {
            errorMsg = result.payload;
          }
        } catch {
          // Not JSON, use as-is
          errorMsg = result.payload;
        }
      } else if (
        typeof result.payload === "object" &&
        typeof result.payload.message === "string"
      ) {
        errorMsg = result.payload.message;
      }
    } else if (error) {
      errorMsg = error;
    }

    if (
      result?.type &&
      result.type.endsWith("/fulfilled") &&
      result?.payload?.token
    ) {
      navigate("/flight-companion");
    } else {
      setApiError(errorMsg);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen && !!apiError}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%" }}
        >
          {apiError}
        </Alert>
      </Snackbar>
      <Box
        maxWidth={600}
        mx="auto"
        my={20}
        p={10}
        boxShadow={2}
        borderRadius={2}
        bgcolor="background.paper"
      >
        <Typography
          variant="h3"
          mb={2}
          className="text-center text-gray-900 dark:text-gray-100 mb-10"
        >
          Login
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2, padding: 2, fontSize: 16, fontWeight: "bold" }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          {/* Prompt for existing users to login */}
          <Box
            mb={3}
            textAlign="center"
            className="mt-8 flex justify-center items-center"
          >
            <Typography
              variant="body1"
              sx={{ fontSize: 16, color: "#374151", display: "inline", mr: 1 }}
              className="dark:text-gray-100"
            >
              {t("noAccount", "Don't have an account?")}
            </Typography>
            <Typography
              variant="body1"
              component="span"
              onClick={() => navigate("/register")}
              sx={{
                fontSize: 16,
                color: "primary.main",
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  textDecoration: "underline",
                },
              }}
              className="dark:text-gray-100"
            >
              {t("registerNow", "Register now")}
            </Typography>
          </Box>
        </form>
      </Box>
    </>
  );
};

export default Login;
