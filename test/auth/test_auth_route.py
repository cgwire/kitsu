from test.base import ApiDBTestCase

from zou.app.utils import auth


class AuthTestCase(ApiDBTestCase):

    def setUp(self):
        super(AuthTestCase, self).setUp()

        self.generate_fixture_person()
        self.person.update({
            "password": auth.encrypt_password("secretpassword")
        })

        self.person_dict = self.person.serialize()
        self.credentials = {
            "email": self.person_dict["email"],
            "password": "secretpassword"
        }

        self.get("auth/logout")

    def assertIsAuthenticated(self):
        is_authenticated = self.get("auth/authenticated")
        self.assertEquals(is_authenticated["authenticated"], True)

    def assertIsNotAuthenticated(self):
        self.get("auth/authenticated", 401)

    def test_login(self):
        self.assertIsNotAuthenticated()
        self.post("auth/login", self.credentials, 200)
        self.assertIsAuthenticated()
        self.get("auth/logout")

    def test_login_wrong_credentials(self):
        self.post("auth/login", {}, 400)
        self.get("auth/authenticated", 401)

        credentials = {
            "email": self.person_dict["email"],
            "password": "wrongpassword"
        }
        self.post("auth/login", credentials, 400)
        self.assertIsNotAuthenticated()

    def test_logout(self):
        self.post("auth/login", self.credentials, 200)
        self.assertIsAuthenticated()
        self.get("auth/logout")
        self.assertIsNotAuthenticated()

    def test_register(self):
        credentials = {
            "email": "alice@doe.com",
            "password": "123456",
            "password_2": "123456",
            "first_name": "Alice",
            "last_name": "Doe"
        }
        self.post("auth/register", credentials, 201)

        self.assertIsNotAuthenticated()
        self.post("auth/login", credentials, 200)
        self.assertIsAuthenticated()
        self.get("auth/logout")

    def test_register_bad_email(self):
        credentials = {
            "email": "alicedoecom",
            "password": "123456",
            "password_2": "123456",
            "first_name": "Alice",
            "last_name": "Doe"
        }
        self.post("auth/register", credentials, 400)

    def test_register_different_password(self):
        credentials = {
            "email": "alice@doe.com",
            "password": "123456",
            "password_2": "123457",
            "first_name": "Alice",
            "last_name": "Doe"
        }
        self.post("auth/register", credentials, 400)

    def test_register_password_too_short(self):
        credentials = {
            "email": "alice@doe.com",
            "password": "123",
            "password_2": "123",
            "first_name": "Alice",
            "last_name": "Doe"
        }
        self.post("auth/register", credentials, 400)

    def test_change_password(self):
        user_data = {
            "email": "alice@doe.com",
            "password": "123456",
            "password_2": "123456",
            "first_name": "Alice",
            "last_name": "Doe"
        }
        credentials = {
            "email": "alice@doe.com",
            "password": "123456",
        }
        self.post("auth/register", user_data, 201)
        self.post("auth/login", credentials, 200)

        new_password = {
            "old_password": "123456",
            "password": "654321",
            "password_2": "654321"
        }
        credentials = {
            "email": "alice@doe.com",
            "password": "654321",
        }

        self.post("auth/change-password", new_password, 200)
        self.get("auth/logout")
        self.post("auth/login", credentials, 200)
        self.assertIsAuthenticated()
