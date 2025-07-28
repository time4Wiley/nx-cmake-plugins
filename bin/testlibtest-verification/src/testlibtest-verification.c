#include "testlibtest-verification.h"

static int setup(void **state) {
    (void) state;
    return 0;
}

static int teardown(void **state) {
    (void) state;
    return 0;
}

static void test_libtest_verification(void **state) {
    (void) state;
    testVerification();
}

int main(void) {
    const struct CMUnitTest libtest_verification_tests[] = {
        cmocka_unit_test(test_libtest_verification),
    };
    return cmocka_run_group_tests(libtest_verification_tests, setup, teardown);
}

