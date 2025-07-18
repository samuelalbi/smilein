import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, storeAuthToken } from '../../api/auth';
import logo from '../../images/logo/SmileIn-Logo-Black.png'
import logo2 from '../../images/logo/SmileIn-Logo-White.png'
import useColorMode from '../../hooks/useColorMode';

interface SignInProps {
  onSignIn?: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [colorMode] = useColorMode();

  const theme = colorMode == 'dark'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Pastikan mencegah default form submission

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await login({ username: username, password });
      storeAuthToken(response);

      if (onSignIn) {
        onSignIn();
      }

      const userType = response.user_type;
      if (userType === 'STUDENT') {
        navigate('/student-dashboard');
      } else if (userType === 'INSTRUCTOR') {
        navigate('/instructor-dashboard');
      } else if (userType === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error('Login error:', err);

      // Hindari refresh dengan menampilkan pesan error spesifik
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid username or password');
            break;
          case 403:
            setError('Access forbidden. Please check your credentials.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An error occurred during login. Please try again.');
        }
      } else if (err.message) {
        // Tangani error jaringan atau error lain
        setError(err.message || 'Login failed. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-boxdark">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex w-full max-w-[1400px] flex-wrap items-center justify-center">
            <div className="hidden w-full xl:block xl:w-1/2">
              <div className="py-17.5 px-26 text-center">
                <div className="flex items-center justify-center">
                  <img
                    src={theme ? logo2 : logo}
                    alt="smilein-logo"
                    className='w-100'
                  />
                </div>
                <p className="2xl:px-20 text-2xl">
                  You Smile, You In
                </p>
              </div>
            </div>

            <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
              <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                  Masuk ke SmileIn Dashbor
                </h2>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-500 dark:bg-red-500/10">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter nama user anda"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Masukan kata sandi anda"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <button
                      type="submit"
                      className={`w-full cursor-pointer rounded-lg border p-4 text-white transition hover:bg-opacity-90 disabled:opacity-70 ${theme
                        ? 'border-primary bg-primary'
                        : 'border-primary bg-[#253340]'
                        }`}
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;