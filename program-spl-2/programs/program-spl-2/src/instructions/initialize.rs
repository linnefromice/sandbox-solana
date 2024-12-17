use anchor_lang::prelude::*;
use anchor_spl::token::Token;

pub fn execute(_ctx: Context<Initialize>) -> Result<()> {
    Ok(())
}

#[account]
pub struct RootState {}
impl RootState {
    pub const MAX_SIZE: usize = 0;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + RootState::MAX_SIZE,
        seeds = [b"root"],
        bump
    )]
    pub state: Account<'info, RootState>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
