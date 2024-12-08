use anchor_lang::prelude::*;

declare_id!("7KA9m77s3r75FcuJDJDhirgELXZD2rLw9JNw8GB9XFtZ");

#[program]
pub mod program_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
