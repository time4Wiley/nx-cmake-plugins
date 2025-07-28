#include "testmycpp-cli.h"

TEST(libmycpp_cli, test_mycpp_cli) {
    EXPECT_EQ(mycppCli(), 0);
}

