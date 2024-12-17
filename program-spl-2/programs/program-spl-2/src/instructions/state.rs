use anchor_lang::prelude::*;

#[account]
pub struct RootState {
    pub total_amount: u64,
    pub authority: Pubkey,
}
// ref: https://www.anchor-lang.com/docs/space#type-chart
impl RootState {
    pub const MAX_SIZE: usize = 8 + 8 + 32;
}

#[account]
pub struct DepositState {
    pub total_amount: u64,
}
impl DepositState {
    pub const MAX_SIZE: usize = 8 + 8;
}
